# BioAI Hub

[![AI Service](https://github.com/torillotomas/bioai-hub/actions/workflows/ai-service.yml/badge.svg)](https://github.com/torillotomas/bioai-hub/actions/workflows/ai-service.yml)
[![Frontend](https://github.com/torillotomas/bioai-hub/actions/workflows/frontend.yml/badge.svg)](https://github.com/torillotomas/bioai-hub/actions/workflows/frontend.yml)
[![Backend](https://github.com/torillotomas/bioai-hub/actions/workflows/backend.yml/badge.svg)](https://github.com/torillotomas/bioai-hub/actions/workflows/backend.yml)

Plataforma para analizar radiografías de tórax con IA. Subís una imagen, el modelo detecta hasta 18 patologías y te muestra un mapa de calor (Grad-CAM) que resalta qué zona de la radiografía influyó en el diagnóstico.

Proyecto de aprendizaje personal. La idea era construir algo que funcionara de verdad, no un hello world con modelos de juguete.

---

## Qué hace

Subís una radiografía de tórax, ingresás un ID de paciente y en unos segundos tenés:

- La patología detectada con mayor probabilidad (de una lista de 18)
- Un porcentaje de confianza para cada patología
- Un overlay Grad-CAM — la imagen original con un mapa de calor encima que muestra qué zona miró el modelo para llegar a ese diagnóstico
- El análisis guardado en el historial, asociado a tu usuario

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 · Vite · TypeScript · Tailwind CSS |
| Backend | NestJS · TypeScript · SQLite (TypeORM) |
| IA | FastAPI · PyTorch · torchxrayvision |

## Cómo funciona por dentro

```
Navegador
  └─ POST /api/v1/analysis (multipart/form-data)
       └─ NestJS: valida MIME, tamaño, JWT · hashea imagen · guarda en SQLite
            └─ POST /predict-with-cam (imagen en base64)
                 └─ FastAPI: imagen → DenseNet121 → 18 probabilidades
                           + Grad-CAM (backward sobre denseblock4) → overlay JPEG
```

El modelo es DenseNet121 pre-entrenado en el dataset NIH ChestX-ray14 (112k radiografías), servido por [torchxrayvision](https://github.com/mlmed/torchxrayvision). No hay entrenamiento propio — se descarga automáticamente (~85MB) la primera vez que levantás el servicio de IA.

El Grad-CAM hookea el último dense block del modelo. El mapa de calor sale en resolución nativa 7×7 y se escala a 224×224 antes de superponerse sobre la imagen original con un colormap JET.

## Requisitos

- Node.js 20+, pnpm 9+
- Python 3.11+
- Docker (opcional, pero más cómodo)

## Instalación

```bash
git clone https://github.com/torillotomas/bioai-hub.git
cd bioai-hub

# JS
pnpm install

# Python
cd apps/ai-service && pip install -r requirements.txt
```

Copiá `.env.example` a `.env` y editá al menos los JWT secrets antes de levantar.

## Levantar

**Con Docker** (recomendado):
```bash
docker compose up
```

**Sin Docker** (3 terminales):
```bash
# IA
cd apps/ai-service && uvicorn app.main:app --port 8000 --reload

# Backend
cd apps/backend && pnpm run dev

# Frontend
cd apps/frontend && pnpm run dev
```

Abrí http://localhost:5173. La primera vez que arranca el servicio de IA descarga el modelo — esperá unos segundos antes de hacer el primer análisis.

## API

Requiere autenticación JWT. Primero registrarse en `POST /auth/register` y luego `POST /auth/login` para obtener el token.

### `POST /api/v1/analysis`

```
Authorization: Bearer <token>
Content-Type: multipart/form-data

file:     <imagen> (JPEG · PNG · WebP · máx 10MB)
metadata: { "patientId": "PAC-001", "studyType": "chest_xray" }
```

```json
{
  "analysis_id": "uuid",
  "status": "completed",
  "result": {
    "prediction": "Pneumonia",
    "confidence": 0.87,
    "class_scores": {
      "Pneumonia": 0.87,
      "Atelectasis": 0.43,
      "Edema": 0.21
    },
    "model_version": "v2.0.0",
    "inference_time_ms": 380,
    "heatmap_b64": "<JPEG en base64>"
  },
  "audit": {
    "processed_at": "2026-06-02T16:00:00.000Z",
    "node_version": "v22.x",
    "image_hash_sha256": "abc123..."
  }
}
```

### `GET /api/v1/analysis`

Devuelve los últimos 20 análisis del usuario autenticado, ordenados por fecha.

### Errores

| Código | Cuándo |
|---|---|
| 401 | Sin token o token vencido |
| 413 | Imagen mayor a 10MB |
| 415 | Formato no soportado |
| 503 | El servicio de IA no está corriendo |

## Tests

```bash
# Python — predictor, transforms, health endpoint, Grad-CAM (16 tests)
cd apps/ai-service && pytest tests/ -v

# Backend — auth service (9 tests unitarios + 8 e2e)
cd apps/backend && pnpm test
```

Los tests de Python no necesitan el modelo descargado — usan mocks con pesos aleatorios.

## Patologías detectadas

Las 18 clases del dataset NIH ChestX-ray14: Atelectasis, Consolidation, Infiltration, Pneumothorax, Edema, Emphysema, Fibrosis, Effusion, Pneumonia, Pleural Thickening, Cardiomegaly, Nodule, Mass, Hernia, Lung Lesion, Fracture, Lung Opacity, Enlarged Cardiomediastinum.

---

> Proyecto educativo. Los resultados del modelo no reemplazan el criterio de un médico.
