import torchxrayvision as xrv


def load_model() -> xrv.models.DenseNet:
    model = xrv.models.DenseNet(weights="densenet121-res224-all")
    model.eval()
    return model
