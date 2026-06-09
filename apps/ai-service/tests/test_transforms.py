from PIL import Image
from app.model.transforms import inference_transforms


def test_output_shape():
    img = Image.new("RGB", (512, 400))
    tensor = inference_transforms(img)
    assert tensor.shape == (1, 3, 224, 224), f"Shape inesperado: {tensor.shape}"


def test_output_dtype():
    img = Image.new("RGB", (100, 100))
    tensor = inference_transforms(img)
    assert tensor.dtype.is_floating_point, "El tensor debe ser float"


def test_normalized_range():
    img = Image.new("RGB", (224, 224), color=(255, 255, 255))
    tensor = inference_transforms(img)
    assert tensor.min().item() >= -1024.0
    assert tensor.max().item() <= 1024.0
