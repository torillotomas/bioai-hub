"""
Script de entrenamiento — BioAI Hub (Hito 2)
Dataset: Chest X-Ray Images (Pneumonia) — Kaggle / Paul Mooney
2 clases: NORMAL, PNEUMONIA

Uso:
    cd apps/ai-service
    python scripts/train.py
    python scripts/train.py --epochs 8 --samples-per-class 400
"""

import argparse
import sys
from pathlib import Path
from collections import Counter

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, WeightedRandomSampler, Subset
from torchvision.datasets import ImageFolder

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.model.architecture import BioAICNN, NUM_CLASSES, CLASS_NAMES
from app.model.transforms import train_transforms, inference_transforms


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Entrenamiento BioAI CNN")
    p.add_argument("--epochs",            type=int,   default=5,    help="Epochs de entrenamiento")
    p.add_argument("--batch",             type=int,   default=16,   help="Batch size")
    p.add_argument("--lr",                type=float, default=1e-3, help="Learning rate")
    p.add_argument("--samples-per-class", type=int,   default=300,  help="Imágenes por clase (balanceo)")
    p.add_argument("--val-limit",         type=int,   default=100,  help="Máx imágenes de validación")
    p.add_argument("--out",               type=str,   default="models/model.pth", help="Ruta de salida")
    return p.parse_args()


def download_dataset() -> Path:
    try:
        import kagglehub
    except ImportError:
        print("[ERROR] kagglehub no instalado. Ejecutá: pip install kagglehub")
        sys.exit(1)

    print("[dataset] Verificando dataset en caché...")
    path = kagglehub.dataset_download("paultimothymooney/chest-xray-pneumonia")
    print(f"[dataset] Listo en: {path}")
    return Path(path)


def find_split(dataset_path: Path, split: str) -> Path:
    for candidate in [
        dataset_path / split,
        dataset_path / "chest_xray" / split,
        *dataset_path.rglob(split),
    ]:
        if Path(candidate).is_dir():
            return Path(candidate)
    raise FileNotFoundError(f"No se encontró '{split}' en {dataset_path}")


def make_balanced_subset(dataset: ImageFolder, samples_per_class: int) -> Subset:
    """Toma hasta samples_per_class imágenes de cada clase."""
    indices_by_class: dict[int, list[int]] = {}
    for idx, (_, label) in enumerate(dataset.samples):
        indices_by_class.setdefault(label, []).append(idx)

    selected = []
    for label, indices in sorted(indices_by_class.items()):
        selected.extend(indices[:samples_per_class])

    return Subset(dataset, selected)


def make_weighted_sampler(subset: Subset, dataset: ImageFolder) -> WeightedRandomSampler:
    """Sampler que compensa el desbalance dando más peso a la clase minoritaria."""
    labels = [dataset.samples[i][1] for i in subset.indices]
    counts = Counter(labels)
    total = sum(counts.values())

    class_weight = {cls: total / count for cls, count in counts.items()}
    sample_weights = [class_weight[label] for label in labels]

    return WeightedRandomSampler(sample_weights, num_samples=len(sample_weights), replacement=True)


def train(args: argparse.Namespace) -> None:
    print(f"\n{'='*55}")
    print(f"  BioAI Hub — Entrenamiento (balanceado)")
    print(f"  Clases: {CLASS_NAMES}")
    print(f"  Epochs: {args.epochs} | Batch: {args.batch} | LR: {args.lr}")
    print(f"  Samples por clase: {args.samples_per_class}")
    print(f"{'='*55}\n")

    device = torch.device("cpu")

    dataset_path = download_dataset()
    train_dir = find_split(dataset_path, "train")
    val_dir   = find_split(dataset_path, "val")

    full_train = ImageFolder(train_dir, transform=train_transforms)
    val_ds     = ImageFolder(val_dir,   transform=inference_transforms)

    print(f"[data] Clases detectadas: {full_train.classes}")

    # Distribución original
    counts = Counter(label for _, label in full_train.samples)
    for cls_idx, name in enumerate(full_train.classes):
        print(f"[data] {name}: {counts[cls_idx]} imágenes en train")

    # Subconjunto balanceado
    train_subset = make_balanced_subset(full_train, args.samples_per_class)
    sampler      = make_weighted_sampler(train_subset, full_train)

    # Val: tomamos un subconjunto si es muy pequeño de por sí
    if len(val_ds) > args.val_limit:
        val_ds = Subset(val_ds, list(range(args.val_limit)))

    print(f"\n[data] Imágenes de entrenamiento: {len(train_subset)} (balanceadas)")
    print(f"[data] Imágenes de validación:    {len(val_ds)}\n")

    train_loader = DataLoader(train_subset, batch_size=args.batch, sampler=sampler,  num_workers=0)
    val_loader   = DataLoader(val_ds,       batch_size=args.batch, shuffle=False, num_workers=0)

    model     = BioAICNN(num_classes=NUM_CLASSES).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)

    # Pesos de clase en el loss: penaliza más los errores en la clase minoritaria
    class_counts  = [counts[i] for i in range(NUM_CLASSES)]
    class_weights = torch.tensor(
        [max(class_counts) / c for c in class_counts], dtype=torch.float
    )
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    print(f"[loss] Pesos de clase: { {CLASS_NAMES[i]: round(class_weights[i].item(), 2) for i in range(NUM_CLASSES)} }\n")

    best_val_acc = 0.0

    for epoch in range(1, args.epochs + 1):
        # ── Entrenamiento ──────────────────────────────────────────
        model.train()
        running_loss = 0.0
        correct = total = 0

        for batch_idx, (images, labels) in enumerate(train_loader):
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            correct += (outputs.argmax(1) == labels).sum().item()
            total   += labels.size(0)

            if (batch_idx + 1) % 5 == 0 or (batch_idx + 1) == len(train_loader):
                print(
                    f"  Epoch [{epoch}/{args.epochs}] "
                    f"Batch [{batch_idx+1}/{len(train_loader)}] "
                    f"Loss: {running_loss/(batch_idx+1):.4f} "
                    f"Acc: {100*correct/total:.1f}%"
                )

        # ── Validación ─────────────────────────────────────────────
        model.eval()
        val_correct = val_total = 0
        val_preds: list[int] = []

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                preds = outputs.argmax(1)
                val_correct += (preds == labels).sum().item()
                val_total   += labels.size(0)
                val_preds.extend(preds.tolist())

        val_acc = 100 * val_correct / val_total if val_total else 0
        pred_dist = Counter(val_preds)
        pred_str  = " | ".join(f"{CLASS_NAMES[k]}: {v}" for k, v in sorted(pred_dist.items()))
        print(f"\n  → Epoch {epoch} | Val Acc: {val_acc:.1f}% | Preds: [{pred_str}]\n")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            out_path = Path(args.out)
            out_path.parent.mkdir(parents=True, exist_ok=True)
            torch.save(model.state_dict(), out_path)
            print(f"  [checkpoint] Mejor modelo guardado ({val_acc:.1f}%) → {out_path.resolve()}\n")

    print(f"{'='*55}")
    print(f"  Entrenamiento completado. Mejor Val Acc: {best_val_acc:.1f}%")
    print(f"  Modelo en: {Path(args.out).resolve()}")
    print(f"{'='*55}\n")


if __name__ == "__main__":
    train(parse_args())
