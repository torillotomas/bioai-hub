import base64

import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image


class GradCAM:
    """
    Grad-CAM sobre el último bloque convolucional de EfficientNet-B3.
    Hookea model.features[-1] — feature maps [1, 1536, 7×7] para input 224×224.
    """

    def __init__(self, model: nn.Module):
        self._model = model
        self._activations: torch.Tensor | None = None
        self._gradients: torch.Tensor | None = None

        model.features[-1].register_forward_hook(self._fwd_hook)
        model.features[-1].register_full_backward_hook(self._bwd_hook)

    def _fwd_hook(self, module, input, output):  # noqa: A002
        self._activations = output.detach()

    def _bwd_hook(self, module, grad_input, grad_output):
        self._gradients = grad_output[0].detach()

    def generate(
        self,
        tensor: torch.Tensor,
        pathology_name: str,
        original_image: Image.Image,
    ) -> str:
        """
        Devuelve la imagen original superpuesta con el heatmap, codificada en base64 JPEG.
        tensor: [1, 3, 224, 224] — mismo formato que la inferencia normal.
        """
        pathologies = list(self._model.pathologies)
        class_idx = pathologies.index(pathology_name) if pathology_name in pathologies else 0

        self._activations = None
        self._gradients = None
        self._model.eval()

        logits = self._model(tensor)                               # forward → dispara fwd hook
        self._model.zero_grad()
        torch.sigmoid(logits)[0, class_idx].backward()            # backward → dispara bwd hook

        assert self._activations is not None and self._gradients is not None

        # Pesos: promedio global de gradientes por canal → [1, C, 1, 1]
        weights = self._gradients.mean(dim=(2, 3), keepdim=True)

        # Suma ponderada de feature maps + ReLU → [7, 7]
        cam = F.relu((weights * self._activations).sum(dim=1, keepdim=True))
        cam_np = cam[0, 0].numpy()

        # Normalizar a [0, 1]
        cam_min, cam_max = cam_np.min(), cam_np.max()
        cam_np = (cam_np - cam_min) / (cam_max - cam_min) if cam_max > cam_min else np.zeros_like(cam_np)

        # Redimensionar a 224×224 y aplicar colormap JET
        cam_resized = cv2.resize(cam_np, (224, 224))
        heatmap_bgr = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
        heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)

        # Superponer sobre imagen original (RGB, redimensionada a 224×224)
        original_np = np.array(original_image.resize((224, 224)).convert("RGB"))
        overlay = cv2.addWeighted(original_np, 0.6, heatmap_rgb, 0.4, 0)

        # Codificar como JPEG base64
        _, buf = cv2.imencode(
            ".jpg",
            cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR),
            [cv2.IMWRITE_JPEG_QUALITY, 85],
        )
        return base64.b64encode(buf.tobytes()).decode()
