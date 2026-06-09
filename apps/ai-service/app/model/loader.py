import torch
import torch.nn as nn
import torchvision.models as models
from app.config import settings

PATOLOGIAS = [
    "Atelectasis", "Consolidation", "Infiltration", "Pneumothorax",
    "Edema", "Emphysema", "Fibrosis", "Effusion", "Pneumonia",
    "Pleural_Thickening", "Cardiomegaly", "Nodule", "Mass", "Hernia",
]


def load_model() -> nn.Module:
    model = models.efficientnet_b3(weights=None)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, len(PATOLOGIAS))
    state = torch.load(settings.model_path, map_location="cpu", weights_only=False)
    if "model_state_dict" in state:
        state = state["model_state_dict"]
    model.load_state_dict(state)
    model.eval()
    model.pathologies = PATOLOGIAS
    return model
