# BioAI Hub — Roadmap de mejoras

> Continuación del proyecto tras completar los 4 hitos iniciales.
> Cada fase es independiente y construye sobre la anterior.
> Fecha de inicio: 2026-05-29

---

## Fase 1 — CI/CD con GitHub Actions

**Objetivo:** Cada vez que hagas `git push`, GitHub ejecuta automáticamente los tests de Python y el type-check de TypeScript. Si algo falla, el push queda marcado en rojo y sabés antes de mergear.

**Lo que vas a aprender:**
- Cómo funciona un pipeline de CI/CD
- Definición de workflows en YAML
- Cómo correr tests en un entorno limpio (sin tu máquina local)

**Archivos a crear:**
```
.github/
└── workflows/
    ├── ai-service.yml     # pytest en cada push
    └── frontend.yml       # tsc --noEmit en cada push
```

**Criterios de aceptación:**
- [ ] Badge de CI en el README que muestra passing/failing
- [ ] `pytest tests/ -v` corre automáticamente en GitHub
- [ ] `tsc --noEmit` corre automáticamente en GitHub
- [ ] Un push con un test roto muestra el workflow en rojo

**Dificultad:** Baja | **Tiempo estimado:** 1 sesión

---

## Fase 2 — Historial de análisis con base de datos

**Objetivo:** Cada análisis se guarda en una base de datos SQLite. El dashboard muestra un historial de los últimos análisis realizados con su resultado y fecha.

**Lo que vas a aprender:**
- TypeORM con NestJS (patrón repositorio)
- Migraciones de base de datos
- Gestión de estado global en React con Zustand

**Stack nuevo:**
- `@nestjs/typeorm` + `typeorm` + `better-sqlite3`
- `zustand` en el frontend

**Archivos a crear/modificar:**
```
apps/backend/src/
├── database/
│   └── database.module.ts
└── analysis/
    ├── entities/
    │   └── analysis.entity.ts    # tabla analyses
    └── analysis.repository.ts

apps/frontend/src/
├── stores/
│   └── analysisStore.ts          # historial en Zustand
└── components/
    └── history/
        ├── HistoryPanel.tsx
        └── HistoryItem.tsx
```

**Criterios de aceptación:**
- [ ] Cada análisis se persiste en `analyses.db`
- [ ] `GET /api/v1/analysis` devuelve los últimos 20 análisis
- [ ] El dashboard muestra el historial en un panel lateral
- [ ] El historial sobrevive a reinicios del servidor

**Dificultad:** Media | **Tiempo estimado:** 2 sesiones

---

## Fase 3 — Autenticación JWT

**Objetivo:** Los usuarios pueden registrarse e iniciar sesión. Cada análisis queda asociado al médico que lo realizó. Los endpoints de análisis requieren token válido.

**Lo que vas a aprender:**
- Flujo de autenticación con JWT (access token + refresh token)
- Guards y decoradores en NestJS
- Manejo de sesión en el frontend con contexto de React

**Stack nuevo:**
- `@nestjs/jwt` + `@nestjs/passport` + `bcrypt`
- Contexto de autenticación en React

**Archivos a crear:**
```
apps/backend/src/
└── auth/
    ├── auth.module.ts
    ├── auth.controller.ts     # POST /auth/register, POST /auth/login
    ├── auth.service.ts
    ├── strategies/
    │   └── jwt.strategy.ts
    └── guards/
        └── jwt-auth.guard.ts

apps/frontend/src/
├── context/
│   └── AuthContext.tsx
└── pages/
    ├── Login.tsx
    └── Register.tsx
```

**Criterios de aceptación:**
- [ ] `POST /auth/register` crea usuario con contraseña hasheada
- [ ] `POST /auth/login` devuelve access token JWT
- [ ] `POST /api/v1/analysis` rechaza requests sin token (401)
- [ ] El frontend redirige al login si el token expiró
- [ ] Cada análisis guardado incluye el ID del usuario

**Dificultad:** Media-Alta | **Tiempo estimado:** 2-3 sesiones

---

## Fase 4 — Grad-CAM (mapa de calor)

**Objetivo:** Junto al diagnóstico, se muestra la radiografía con un mapa de calor superpuesto indicando qué región de la imagen influyó más en la decisión del modelo.

**Lo que vas a aprender:**
- Cómo funciona Gradient-weighted Class Activation Mapping (Grad-CAM)
- Hooks de PyTorch para capturar gradientes intermedios
- Composición de imágenes con PIL y NumPy

**Stack nuevo:**
- `numpy` + `opencv-python` en Python
- Endpoint nuevo `POST /predict-with-cam` en FastAPI

**Cómo funciona Grad-CAM:**
```
imagen → forward pass → logits
         ↓
gradientes de la clase predicha → última capa conv
         ↓
promedio de gradientes por canal → pesos de activación
         ↓
suma ponderada de feature maps → heatmap
         ↓
resize al tamaño original → superponer sobre la imagen
```

**Archivos a crear:**
```
apps/ai-service/app/
├── services/
│   └── gradcam.py             # lógica de Grad-CAM
└── main.py                    # nuevo endpoint /predict-with-cam

apps/frontend/src/
└── components/analysis/
    └── HeatmapOverlay.tsx     # imagen + heatmap superpuestos
```

**Criterios de aceptación:**
- [ ] `POST /predict-with-cam` devuelve diagnóstico + imagen PNG en base64 con heatmap
- [ ] El frontend muestra la imagen original y la imagen con heatmap lado a lado
- [ ] Las zonas rojas del heatmap coinciden con regiones clínicamente relevantes (pulmones)
- [ ] El endpoint funciona sin romper el `/predict` original

**Dificultad:** Alta | **Tiempo estimado:** 2-3 sesiones

---

## Estado del roadmap

| Fase | Descripción | Estado |
|---|---|---|
| Fase 1 | CI/CD con GitHub Actions | ✅ Completado |
| Fase 2 | Historial con base de datos | ✅ Completado |
| Fase 3 | Autenticación JWT | Pendiente |
| Fase 4 | Grad-CAM | Pendiente |

---

*Una fase a la vez. No avanzar a la siguiente sin validar la anterior en local.*
