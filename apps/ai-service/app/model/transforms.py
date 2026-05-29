from torchvision import transforms

# Estadísticas de normalización estándar ImageNet.
# Para un proyecto real se calcularían sobre el dataset médico específico.
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Pipeline de inferencia: imagen PIL → tensor normalizado
inference_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),                          # [0,255] uint8 → [0,1] float32
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),  # → aprox. [-3, 3]
])

# Pipeline de entrenamiento: agrega augmentation para regularización
train_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])
