import base64

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

from app.model.architecture import BioAICNN


class GradCAM:
    """
    Grad-CAM sobre la última capa convolucional de BioAICNN (features[-1]).
    Los hooks se registran una sola vez al construir la instancia.
    """

    def __init__(self, model: BioAICNN):
        self._model = model
        self._activations: torch.Tensor | None = None
        self._gradients: torch.Tensor | None = None

        model.features[-1].register_forward_hook(self._fwd_hook)
        model.features[-1].register_full_backward_hook(self._bwd_hook)

    def _fwd_hook(self, module, input, output):  # noqa: A002
        self._activations = output

    def _bwd_hook(self, module, grad_input, grad_output):
        self._gradients = grad_output[0]

    def generate(self, tensor: torch.Tensor, class_idx: int, original_image: Image.Image) -> str:
        """
        Devuelve la imagen original superpuesta con el mapa de calor, codificada en base64 JPEG.
        `tensor` debe tener shape [1, 3, 224, 224].
        """
        self._activations = None
        self._gradients = None
        self._model.eval()

        logits = self._model(tensor)          # forward → activa el hook
        self._model.zero_grad()
        logits[0, class_idx].backward()       # backward → activa el hook

        assert self._activations is not None and self._gradients is not None

        # Pesos = promedio global de gradientes por canal → [1, C, 1, 1]
        weights = self._gradients.mean(dim=(2, 3), keepdim=True)

        # Combinación ponderada de feature maps → [1, 1, 28, 28]
        cam = F.relu((weights * self._activations).sum(dim=1, keepdim=True))
        cam_np = cam[0, 0].detach().numpy()   # [28, 28]

        # Normalizar a [0, 1]
        cam_min, cam_max = cam_np.min(), cam_np.max()
        if cam_max > cam_min:
            cam_np = (cam_np - cam_min) / (cam_max - cam_min)
        else:
            cam_np = np.zeros_like(cam_np)

        # Redimensionar a 224x224 y aplicar colormap JET
        cam_resized = cv2.resize(cam_np, (224, 224))
        heatmap_bgr = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
        heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)

        # Superponer sobre imagen original
        original_np = np.array(original_image.resize((224, 224)))
        overlay = cv2.addWeighted(original_np, 0.6, heatmap_rgb, 0.4, 0)

        # Codificar como JPEG base64
        _, buf = cv2.imencode(
            ".jpg",
            cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR),
            [cv2.IMWRITE_JPEG_QUALITY, 85],
        )
        return base64.b64encode(buf.tobytes()).decode()
