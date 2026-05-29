from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app

client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "bioai-ai-service"
    assert "model_loaded" in data
    assert "model_version" in data


def test_predict_returns_503_when_model_not_loaded():
    # Simula que el modelo no fue cargado
    with patch("app.main._predictor", None):
        response = client.post(
            "/predict",
            json={
                "image_b64": "aGVsbG8=",
                "image_format": "png",
                "metadata": {"patient_id": "x", "study_type": "chest_xray"},
            },
        )
    assert response.status_code == 503
