from contextlib import asynccontextmanager
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.model.loader import load_model
from app.schemas import PredictRequest, PredictResponse, PredictWithCamResponse
from app.services.gradcam import GradCAM
from app.services.predictor import Predictor

_predictor: Predictor | None = None
_gradcam: GradCAM | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _predictor, _gradcam
    try:
        model = load_model(settings.model_path)
        _predictor = Predictor(model)
        _gradcam = GradCAM(model)
        print(f"[startup] Modelo cargado desde '{settings.model_path}' ({settings.model_version})")
    except FileNotFoundError as exc:
        print(f"[startup][WARNING] {exc}")
        _predictor = None
        _gradcam = None

    yield

    _predictor = None
    _gradcam = None
    print("[shutdown] AI service detenido")


app = FastAPI(
    title="BioAI — AI Microservice",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "bioai-ai-service",
        "model_loaded": _predictor is not None,
        "model_version": settings.model_version,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest) -> PredictResponse:
    if _predictor is None:
        raise HTTPException(
            status_code=503,
            detail="Modelo no disponible. Ejecutá 'python scripts/train.py' primero.",
        )

    try:
        return _predictor.predict(payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error de inferencia: {exc}")


@app.post("/predict-with-cam", response_model=PredictWithCamResponse)
def predict_with_cam(payload: PredictRequest) -> PredictWithCamResponse:
    if _predictor is None or _gradcam is None:
        raise HTTPException(
            status_code=503,
            detail="Modelo no disponible. Ejecutá 'python scripts/train.py' primero.",
        )

    try:
        return _predictor.predict_with_cam(payload, _gradcam)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error de inferencia: {exc}")
