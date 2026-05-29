# BioAI-Hub — Plan de Implementación y Desarrollo

> **Stack:** React + Vite + TypeScript | NestJS + TypeScript | Python + FastAPI + PyTorch  
> **Metodología:** Desarrollo guiado por hitos. No se avanza al siguiente hito sin validación local del anterior.  
> **Fecha de inicio:** 2026-05-29

---

## 1. ARQUITECTURA DE DATOS Y FLUJO

### Visión general del sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                           │
│  React + Vite + TypeScript                                          │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────────┐  │
│  │ Drag & Drop │───▶│ File Obj     │───▶│ FormData (multipart)  │  │
│  │ Component   │    │ (JPEG/PNG)   │    │ + metadata JSON       │  │
│  └─────────────┘    └──────────────┘    └──────────┬────────────┘  │
└──────────────────────────────────────────────────── │ ─────────────┘
                                                       │ HTTP POST
                                                       │ /api/analysis
┌──────────────────────────────────────────────────── ▼ ─────────────┐
│                    BACKEND DE GESTIÓN                               │
│  NestJS + TypeScript (puerto 3000)                                  │
│                                                                     │
│  1. Interceptor de validación → MIME type whitelist                 │
│  2. Multer/Busboy → lee el stream → buffer en memoria (<10MB)       │
│  3. Sharp → normalización: resize 224×224, JPEG → PNG si necesario  │
│  4. Empaqueta: { image: Buffer(base64), metadata: {...} }           │
│  5. HTTP POST interno → Python (Axios/Got)                          │
│  6. Recibe JSON de diagnóstico → lo enriquece (audit log, timestamps)│
│  7. Devuelve respuesta final al cliente                             │
└──────────────────────────────────────────────────── │ ─────────────┘
                                                       │ HTTP POST (interno)
                                                       │ /predict
                                                       │ Content-Type: application/json
                                                       │ { "image_b64": "...", "metadata": {...} }
┌──────────────────────────────────────────────────── ▼ ─────────────┐
│                  MICROSERVICIO DE IA                                │
│  FastAPI + Python 3.11 (puerto 8000)                                │
│                                                                     │
│  1. Pydantic valida el schema del payload                           │
│  2. base64.decode → bytes → BytesIO                                 │
│  3. Pillow (PIL) → Image.open() → RGB                               │
│  4. torchvision.transforms → Resize, ToTensor, Normalize            │
│     → tensor shape: [1, 3, 224, 224] dtype: float32                │
│  5. model.eval() → torch.no_grad() → forward pass                  │
│  6. softmax(logits) → probabilidades por clase                      │
│  7. Retorna: { prediction, confidence, class_scores, model_version }│
└─────────────────────────────────────────────────────────────────────┘
```

### Contratos de datos detallados

#### Frontend → Node (`multipart/form-data`)

```
POST /api/v1/analysis
Content-Type: multipart/form-data

file:      <binary image>
metadata:  { patientId, studyType, notes, uploadedAt }
```

#### Node → Python (`application/json`)

```json
POST http://python-service:8000/predict
{
  "image_b64": "<base64 string>",
  "image_format": "png",
  "metadata": {
    "patient_id": "uuid",
    "study_type": "chest_xray | mri | ct",
    "dimensions_original": { "w": 1024, "h": 768 }
  }
}
```

#### Python → Node (`application/json`)

```json
{
  "prediction": "Pneumonia",
  "confidence": 0.94,
  "class_scores": {
    "Normal": 0.04,
    "Pneumonia": 0.94,
    "COVID-19": 0.02
  },
  "model_version": "v1.2.0",
  "inference_time_ms": 43
}
```

#### Node → Frontend (`application/json`)

```json
{
  "analysis_id": "uuid-v4",
  "status": "completed",
  "result": {
    "prediction": "Pneumonia",
    "confidence": 0.94,
    "class_scores": { "Normal": 0.04, "Pneumonia": 0.94, "COVID-19": 0.02 },
    "model_version": "v1.2.0",
    "inference_time_ms": 43
  },
  "audit": {
    "processed_at": "2026-05-29T12:00:00.000Z",
    "node_version": "20.x",
    "image_hash_sha256": "abc123..."
  }
}
```

### Manejo de errores por capa

| Capa | Error | Código HTTP | Comportamiento |
|---|---|---|---|
| Frontend | Archivo no imagen | — | Validación local, sin llamada al servidor |
| Node | MIME inválido | 415 | Rechaza antes de leer el buffer |
| Node | Archivo >10MB | 413 | Rechaza en el interceptor de Multer |
| Node | Python no responde | 503 | Circuit breaker, retry ×2 con backoff |
| Python | Imagen corrupta | 422 | Pydantic ValidationError |
| Python | Modelo no cargado | 500 | Health check expone estado del modelo |

---

## 2. CRONOGRAMA DE HITOS SPRINT-BY-SPRINT

---

### HITO 1 — Fundaciones: Monorrepo, entornos y contratos mock

**Objetivo:** Todo el equipo puede clonar el repositorio, levantar los tres servicios con un solo comando y hacer una llamada end-to-end contra mocks. No hay lógica de negocio real todavía.

#### Criterios de aceptación técnicos

- [ ] `pnpm install` en la raíz instala todas las dependencias sin errores
- [ ] `docker compose up` levanta los 3 servicios sin errores (opcional)
- [ ] `POST /api/v1/analysis` con una imagen real devuelve un JSON mock con status 200
- [ ] `GET /health` responde en los tres servicios
- [ ] El frontend compila con `vite build` sin errores de TypeScript

#### Estructura de archivos

```
bioai-hub/
├── package.json                    # workspace root (pnpm)
├── pnpm-workspace.yaml
├── .gitignore
├── docker-compose.yml
├── .env.example
│
├── apps/
│   ├── frontend/                   # React + Vite + TS
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       └── types/
│   │           └── analysis.ts     # Tipos compartidos del contrato API
│   │
│   ├── backend/                    # NestJS + TS
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── health/
│   │       │   └── health.controller.ts
│   │       └── analysis/
│   │           ├── analysis.controller.ts  # Recibe multipart, devuelve mock
│   │           ├── analysis.module.ts
│   │           └── dto/
│   │               ├── create-analysis.dto.ts
│   │               └── analysis-result.dto.ts
│   │
│   └── ai-service/                 # Python + FastAPI
│       ├── requirements.txt
│       ├── pyproject.toml
│       ├── .python-version
│       └── app/
│           ├── main.py             # FastAPI app + /health + /predict mock
│           ├── schemas.py          # Pydantic models (PredictRequest/Response)
│           └── config.py           # Settings (puerto, timeouts)
│
└── packages/
    └── shared-types/               # Tipos TS compartidos (opcional)
        ├── package.json
        └── src/
            └── index.ts
```

---

### HITO 2 — Microservicio de IA real

**Objetivo:** El servicio Python acepta una imagen real, la convierte en tensor y devuelve un diagnóstico del modelo PyTorch entrenado. Funciona de forma completamente aislada.

#### Criterios de aceptación técnicos

- [ ] Script de entrenamiento corre end-to-end y guarda `model.pth`
- [ ] `POST /predict` con imagen real devuelve `confidence > 0` y `class_scores` que suman `1.0`
- [ ] `GET /health` expone `{ model_loaded: true, model_version: "..." }`
- [ ] Tests unitarios de la pipeline de transformación pasan (`pytest`)
- [ ] El servicio rechaza con 422 si recibe un PDF (base64 de un PDF)

#### Estructura de archivos

```
apps/ai-service/
├── scripts/
│   └── train.py                    # Script de entrenamiento PyTorch
├── models/
│   └── .gitkeep                    # model.pth se ignora en git
├── app/
│   ├── main.py                     # Rutas reales implementadas
│   ├── schemas.py                  # Pydantic con validaciones
│   ├── config.py
│   ├── model/
│   │   ├── loader.py               # Carga model.pth en startup
│   │   ├── architecture.py         # Definición de la CNN/ResNet
│   │   └── transforms.py           # Pipeline de normalización
│   └── services/
│       └── predictor.py            # Lógica: base64 → tensor → inferencia
└── tests/
    ├── test_transforms.py
    ├── test_predictor.py
    ├── test_health.py
    └── fixtures/
        ├── sample_chest_xray.png
        └── sample.pdf              # Para test de rechazo
```

---

### HITO 3 — Backend Node completo

**Objetivo:** NestJS procesa archivos reales, se comunica con Python y maneja todos los errores de producción.

#### Criterios de aceptación técnicos

- [ ] `curl` con imagen real devuelve diagnóstico real (Python del Hito 2 corriendo)
- [ ] Archivos >10MB retornan 413 con mensaje descriptivo
- [ ] PDFs retornan 415 con mensaje descriptivo
- [ ] Si Python está caído, Node retorna 503 (no 500 genérico)
- [ ] Logs estructurados (JSON) con `correlation_id` en cada request

#### Estructura de archivos

```
apps/backend/src/
├── analysis/
│   ├── analysis.controller.ts      # Implementación real con Multer
│   ├── analysis.service.ts         # Orquestación del flujo
│   ├── analysis.module.ts
│   ├── dto/                        # (ya existen, se completan)
│   └── pipes/
│       └── file-validation.pipe.ts # Valida MIME, tamaño
├── ai-client/
│   ├── ai-client.service.ts        # HTTP client hacia Python (Axios)
│   ├── ai-client.module.ts
│   └── ai-client.interceptor.ts    # Retry logic, circuit breaker
├── common/
│   ├── filters/
│   │   └── global-exception.filter.ts
│   ├── interceptors/
│   │   └── logging.interceptor.ts
│   └── middleware/
│       └── correlation-id.middleware.ts
└── config/
    ├── app.config.ts
    └── ai.config.ts
```

---

### HITO 4 — Frontend React completo

**Objetivo:** Dashboard médico funcional end-to-end con UX de nivel producción.

#### Criterios de aceptación técnicos

- [ ] Drag & Drop acepta solo imágenes, rechaza otros formatos visualmente
- [ ] Estados de carga muestran skeleton/spinner durante el análisis
- [ ] Los resultados se muestran con gráfico de barras de probabilidades
- [ ] Maneja errores del servidor con mensajes amigables al usuario
- [ ] Lighthouse Accessibility score ≥ 90
- [ ] No hay errores de TypeScript en `tsc --noEmit`

#### Estructura de archivos

```
apps/frontend/src/
├── components/
│   ├── upload/
│   │   ├── DropZone.tsx            # Drag & Drop con react-dropzone
│   │   ├── FilePreview.tsx         # Thumbnail + metadatos
│   │   └── UploadProgress.tsx      # Estado de carga
│   ├── analysis/
│   │   ├── DiagnosisCard.tsx       # Resultado principal
│   │   ├── ProbabilityChart.tsx    # Barras de class_scores
│   │   └── ConfidenceBadge.tsx     # Indicador visual de confianza
│   └── shared/
│       ├── ErrorBanner.tsx
│       └── LoadingSkeleton.tsx
├── hooks/
│   ├── useAnalysis.ts              # Lógica de llamada + estado (TanStack Query)
│   └── useFileValidation.ts        # Validación local de archivos
├── services/
│   └── analysisApi.ts              # Cliente HTTP tipado
├── stores/
│   └── analysisStore.ts            # Zustand (historial de análisis)
├── pages/
│   └── Dashboard.tsx
└── types/
    └── analysis.ts                 # (ya existe desde Hito 1, se completa)
```

---

## 3. PLAN DE TESTING Y VALIDACIÓN TÉCNICA

### Testing aislado del Microservicio Python (Hito 2)

#### Smoke test con cURL

```bash
# Convertir imagen a base64 y llamar al endpoint
IMAGE_B64=$(base64 -w 0 tests/fixtures/sample_chest_xray.png)

curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d "{
    \"image_b64\": \"$IMAGE_B64\",
    \"image_format\": \"png\",
    \"metadata\": {
      \"patient_id\": \"test-001\",
      \"study_type\": \"chest_xray\"
    }
  }"
```

#### Test de rechazo de archivos inválidos

```bash
# PDF debe retornar HTTP 422
PDF_B64=$(base64 -w 0 tests/fixtures/sample.pdf)

curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d "{\"image_b64\": \"$PDF_B64\", \"image_format\": \"pdf\", \"metadata\": {}}"
```

#### Suite de pytest

| Archivo | Qué verifica |
|---|---|
| `test_transforms.py` | Tensor de salida tiene shape `[1, 3, 224, 224]` y valores en `[-3, 3]` |
| `test_predictor.py` | `class_scores` suman `≈ 1.0` y `confidence` está en `[0, 1]` |
| `test_health.py` | `model_loaded: true` después del startup |

### Testing del Backend Node (Hito 3)

#### Test de archivos inválidos

```bash
# PDF debe retornar 415 Unsupported Media Type
curl -X POST http://localhost:3000/api/v1/analysis \
  -F "file=@document.pdf" \
  -F 'metadata={"patientId":"test-001","studyType":"chest_xray"}'

# Archivo >10MB debe retornar 413 Payload Too Large
# (generar archivo de 11MB con dd en Linux/Mac o fsutil en Windows)
curl -X POST http://localhost:3000/api/v1/analysis \
  -F "file=@archivo_grande.bin"
```

#### Test de resiliencia (Python caído)

```bash
# 1. Detener el servicio de IA
docker compose stop ai-service

# 2. Llamar a Node — debe retornar 503, no 500
curl -X POST http://localhost:3000/api/v1/analysis \
  -F "file=@imagen_valida.png" \
  -F 'metadata={"patientId":"test-001","studyType":"chest_xray"}'
# Esperado: HTTP 503 { "error": "AI service unavailable", "retry_after": 30 }

# 3. Restaurar el servicio
docker compose start ai-service
```

### Matriz de validación por escenario

| Escenario | Capa que lo detecta | Respuesta esperada |
|---|---|---|
| JPEG válido, <5MB | — (pasa todo) | 200 + diagnóstico real |
| PNG válido, <5MB | — (pasa todo) | 200 + diagnóstico real |
| PDF disfrazado de `.jpg` | Node (MIME real con file-type) | 415 |
| Imagen >10MB | Node (Multer límite) | 413 |
| Imagen corrupta (bytes random) | Python (PIL) | 422 |
| Python caído | Node (Axios timeout) | 503 |
| Modelo no cargado en startup | Python (/health) | 503 desde healthcheck |
| Request sin campo `file` | Node (ValidationPipe) | 400 |
| base64 inválido | Python (Pydantic) | 422 |

---

## Decisiones de stack a confirmar antes del Hito 1

Antes de escribir la primera línea de código, confirmar:

| Decisión | Opción A | Opción B |
|---|---|---|
| Package manager JS | `pnpm` (recomendado) | `npm workspaces` |
| Docker desde el inicio | Sí, Hito 1 | No, añadir en Hito 3 |
| Versión Node | 20 LTS | 22 LTS |
| Versión Python | 3.11 | 3.12 |
| Modelo base PyTorch | ResNet-18 (liviano) | EfficientNet-B0 |
| Dataset de referencia | ChestX-ray14 (NIH) | Custom / sintético |

---

## Estado de hitos

| Hito | Estado | Fecha objetivo |
|---|---|---|
| Hito 1 — Fundaciones y mocks | ✅ Completado | 2026-05-29 |
| Hito 2 — Microservicio IA | ✅ Completado | 2026-05-29 |
| Hito 3 — Backend Node | ✅ Completado | 2026-05-29 |
| Hito 4 — Frontend React | ✅ Completado | 2026-05-29 |

---

*Documento generado el 2026-05-29. Actualizar el estado de cada hito a medida que se completa.*
