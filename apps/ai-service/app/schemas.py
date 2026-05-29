from pydantic import BaseModel, field_validator
import base64


class ImageMetadata(BaseModel):
    patient_id: str
    study_type: str
    dimensions_original: dict | None = None


class PredictRequest(BaseModel):
    image_b64: str
    image_format: str
    metadata: ImageMetadata

    @field_validator("image_b64")
    @classmethod
    def validate_base64(cls, v: str) -> str:
        try:
            base64.b64decode(v, validate=True)
        except Exception:
            raise ValueError("image_b64 is not valid base64")
        return v

    @field_validator("image_format")
    @classmethod
    def validate_format(cls, v: str) -> str:
        allowed = {"png", "jpg", "jpeg", "webp"}
        if v.lower() not in allowed:
            raise ValueError(f"image_format '{v}' not allowed. Allowed: {allowed}")
        return v.lower()


class ClassScores(BaseModel):
    model_config = {"populate_by_name": True, "protected_namespaces": ()}

    Normal: float
    Pneumonia: float


class PredictResponse(BaseModel):
    model_config = {"protected_namespaces": ()}

    prediction: str
    confidence: float
    class_scores: dict[str, float]
    model_version: str
    inference_time_ms: int


class PredictWithCamResponse(PredictResponse):
    heatmap_b64: str
