import numpy as np
import torch
import torchxrayvision as xrv


def inference_transforms(image) -> torch.Tensor:
    img_array = np.array(image.convert("L"), dtype=np.float32)
    img_array = xrv.datasets.normalize(img_array, 255)
    img_array = img_array[np.newaxis, :, :]
    transform = xrv.datasets.XRayResizer(224)
    img_array = transform(img_array)
    return torch.from_numpy(img_array).unsqueeze(0)
