import base64
import torch
from io import BytesIO

import pytest
from PIL import Image

from app.schemas import PredictRequest, ImageMetadata
from app.services.predictor import Predictor

PATOLOGIAS = [
    "Atelectasis", "Consolidation", "Infiltration", "Pneumothorax",
    "Edema", "Emphysema", "Fibrosis", "Effusion", "Pneumonia",
    "Pleural_Thickening", "Cardiomegaly", "Nodule", "Mass", "Hernia",
]


class _MockEfficientNet:
    pathologies = PATOLOGIAS

    def __call__(self, tensor):
        # Retorna logits crudos; el Predictor aplica sigmoid
        return torch.randn(1, len(self.pathologies))

    def eval(self):
        return self


def _make_predictor() -> Predictor:
    return Predictor(_MockEfficientNet())


def _image_b64(color: tuple = (128, 128, 128), size: tuple = (224, 224)) -> str:
    buf = BytesIO()
    Image.new("RGB", size, color=color).save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def _make_payload(image_b64: str) -> PredictRequest:
    return PredictRequest(
        image_b64=image_b64,
        image_format="png",
        metadata=ImageMetadata(patient_id="test-001", study_type="chest_xray"),
    )


def test_confidence_in_range():
    predictor = _make_predictor()
    response = predictor.predict(_make_payload(_image_b64()))
    assert 0.0 <= response.confidence <= 1.0


def test_prediction_is_known_class():
    predictor = _make_predictor()
    response = predictor.predict(_make_payload(_image_b64()))
    assert response.prediction in PATOLOGIAS, (
        f"'{response.prediction}' no está en las patologías conocidas"
    )


def test_class_scores_keys_match_pathologies():
    predictor = _make_predictor()
    response = predictor.predict(_make_payload(_image_b64()))
    assert set(response.class_scores.keys()) == set(PATOLOGIAS)


def test_inference_time_positive():
    predictor = _make_predictor()
    response = predictor.predict(_make_payload(_image_b64()))
    assert response.inference_time_ms >= 0


def test_pdf_bytes_raise_value_error():
    pdf_like = base64.b64encode(b"%PDF-1.4 fake content").decode()
    predictor = _make_predictor()
    payload = _make_payload(pdf_like)
    with pytest.raises(ValueError, match="imagen válida"):
        predictor.predict(payload)


def test_different_image_sizes_handled():
    predictor = _make_predictor()
    for size in [(64, 64), (512, 300), (1024, 768)]:
        response = predictor.predict(_make_payload(_image_b64(size=size)))
        assert response.prediction in PATOLOGIAS
