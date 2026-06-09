import base64
from io import BytesIO

import torch
import torch.nn as nn
from PIL import Image

from app.services.gradcam import GradCAM


class _MockEfficientNet(nn.Module):
    pathologies = ["Pneumonia", "Atelectasis"]

    def __init__(self):
        super().__init__()
        # features[-1] debe ser indexable como nn.Sequential
        self.features = nn.Sequential(
            nn.Conv2d(3, 1536, 3, padding=1),
        )
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.head = nn.Linear(1536, len(self.pathologies))

    def forward(self, x):
        feat = self.features(x)                    # [1, 1536, H, W]
        pooled = self.pool(feat)                   # [1, 1536, 1, 1]
        flat = pooled.view(x.shape[0], -1)         # [1, 1536]
        return self.head(flat)                     # logits [1, 2]

    def eval(self):
        return self


def _make_gradcam() -> GradCAM:
    return GradCAM(_MockEfficientNet())


def _make_tensor() -> torch.Tensor:
    return torch.rand(1, 3, 224, 224)


def _make_image() -> Image.Image:
    return Image.new("RGB", (224, 224), color=(100, 120, 140))


def test_gradcam_returns_nonempty_string():
    cam = _make_gradcam()
    result = cam.generate(_make_tensor(), "Pneumonia", _make_image())
    assert isinstance(result, str) and len(result) > 0


def test_gradcam_output_is_valid_base64():
    cam = _make_gradcam()
    result = cam.generate(_make_tensor(), "Pneumonia", _make_image())
    decoded = base64.b64decode(result)
    assert len(decoded) > 0


def test_gradcam_output_is_jpeg_224x224():
    cam = _make_gradcam()
    result = cam.generate(_make_tensor(), "Pneumonia", _make_image())
    img = Image.open(BytesIO(base64.b64decode(result)))
    assert img.format == "JPEG"
    assert img.size == (224, 224)


def test_gradcam_unknown_pathology_does_not_raise():
    cam = _make_gradcam()
    result = cam.generate(_make_tensor(), "DoesNotExist", _make_image())
    assert isinstance(result, str) and len(result) > 0


def test_gradcam_different_pathologies():
    cam = _make_gradcam()
    r1 = cam.generate(_make_tensor(), "Pneumonia", _make_image())
    r2 = cam.generate(_make_tensor(), "Atelectasis", _make_image())
    assert len(r1) > 0 and len(r2) > 0
