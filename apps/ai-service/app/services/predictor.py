import base64
import time
from io import BytesIO

import torch
import torch.nn as nn
from PIL import Image, UnidentifiedImageError

from app.model.transforms import inference_transforms
from app.schemas import PredictRequest, PredictResponse


class Predictor:
    def __init__(self, model: nn.Module):
        self._model = model

    def predict(self, payload: PredictRequest) -> PredictResponse:
        start = time.time()

        image = self._decode_image(payload.image_b64)
        tensor = inference_transforms(image)
        class_scores, prediction, confidence = self._infer(tensor)

        elapsed_ms = int((time.time() - start) * 1000)

        return PredictResponse(
            prediction=prediction,
            confidence=round(confidence, 4),
            class_scores={k: round(v, 4) for k, v in class_scores.items()},
            model_version="v3.0.0",
            inference_time_ms=elapsed_ms,
        )

    def _decode_image(self, image_b64: str) -> Image.Image:
        try:
            raw_bytes = base64.b64decode(image_b64)
            image = Image.open(BytesIO(raw_bytes)).convert("RGB")
        except UnidentifiedImageError:
            raise ValueError(
                "El contenido decodificado no es una imagen válida. "
                "Asegurate de enviar JPEG, PNG o WebP."
            )
        except Exception as exc:
            raise ValueError(f"No se pudo decodificar la imagen: {exc}")
        return image

    # Umbral mínimo para considerar una patología presente.
    # Por debajo de este valor se reporta "No Finding".
    CONFIDENCE_THRESHOLD = 0.3

    def _infer(self, tensor: torch.Tensor) -> tuple[dict[str, float], str, float]:
        with torch.no_grad():
            logits = self._model(tensor)           # [1, num_pathologies]
            probs = torch.sigmoid(logits)[0]       # [num_pathologies]

        pathologies = self._model.pathologies
        scores = {pathologies[i]: probs[i].item() for i in range(len(pathologies))}
        top_class = max(scores, key=lambda k: scores[k])
        top_score = scores[top_class]

        if top_score < self.CONFIDENCE_THRESHOLD:
            return scores, "No Finding", top_score

        return scores, top_class, top_score
