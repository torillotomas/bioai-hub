import base64
import time
from io import BytesIO

import torch
import torch.nn.functional as F
from PIL import Image, UnidentifiedImageError

from app.model.architecture import BioAICNN, CLASS_NAMES
from app.model.transforms import inference_transforms
from app.schemas import PredictRequest, PredictResponse, PredictWithCamResponse


class Predictor:
    def __init__(self, model: BioAICNN):
        self._model = model

    def predict(self, payload: PredictRequest) -> PredictResponse:
        start = time.time()

        image = self._decode_image(payload.image_b64)
        tensor = self._preprocess(image)
        class_scores, prediction, confidence = self._infer(tensor)

        elapsed_ms = int((time.time() - start) * 1000)

        return PredictResponse(
            prediction=prediction,
            confidence=round(confidence, 4),
            class_scores={k: round(v, 4) for k, v in class_scores.items()},
            model_version="v1.0.0",
            inference_time_ms=elapsed_ms,
        )

    def predict_with_cam(self, payload: PredictRequest, gradcam: "GradCAM") -> PredictWithCamResponse:
        from app.services.gradcam import GradCAM  # noqa: F401

        start = time.time()

        image = self._decode_image(payload.image_b64)
        tensor = self._preprocess(image)
        class_scores, prediction, confidence = self._infer(tensor)

        class_idx = CLASS_NAMES.index(prediction)
        heatmap_b64 = gradcam.generate(tensor, class_idx, image)

        elapsed_ms = int((time.time() - start) * 1000)

        return PredictWithCamResponse(
            prediction=prediction,
            confidence=round(confidence, 4),
            class_scores={k: round(v, 4) for k, v in class_scores.items()},
            model_version="v1.0.0",
            inference_time_ms=elapsed_ms,
            heatmap_b64=heatmap_b64,
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

    def _preprocess(self, image: Image.Image) -> torch.Tensor:
        # inference_transforms retorna shape [3, 224, 224]; unsqueeze → [1, 3, 224, 224]
        return inference_transforms(image).unsqueeze(0)

    def _infer(self, tensor: torch.Tensor) -> tuple[dict[str, float], str, float]:
        with torch.no_grad():
            logits = self._model(tensor)             # [1, num_classes]
            probs = F.softmax(logits, dim=1)[0]      # [num_classes]

        scores = {CLASS_NAMES[i]: probs[i].item() for i in range(len(CLASS_NAMES))}
        prediction = max(scores, key=lambda k: scores[k])
        confidence = scores[prediction]

        return scores, prediction, confidence
