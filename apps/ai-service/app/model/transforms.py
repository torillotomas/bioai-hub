import torch
from torchvision import transforms
from PIL import Image

_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def inference_transforms(image: Image.Image) -> torch.Tensor:
    return _transform(image.convert("RGB")).unsqueeze(0)
