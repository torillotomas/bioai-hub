import torch
from pathlib import Path
from app.model.architecture import BioAICNN, NUM_CLASSES


def load_model(model_path: str) -> BioAICNN:
    """
    Carga el modelo desde un archivo .pth.
    Lanza FileNotFoundError si el archivo no existe — el caller decide cómo manejarlo.
    """
    path = Path(model_path)
    if not path.exists():
        raise FileNotFoundError(
            f"Model file not found: {path.resolve()}\n"
            "Run: python scripts/train.py"
        )

    model = BioAICNN(num_classes=NUM_CLASSES)

    # map_location="cpu" garantiza que funciona sin GPU
    state_dict = torch.load(path, map_location="cpu", weights_only=True)
    model.load_state_dict(state_dict)
    model.eval()

    return model
