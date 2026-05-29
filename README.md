# BioAI Hub — Medical Image Analysis Platform

[![AI Service Tests](https://github.com/torillotomas/bioai-hub/actions/workflows/ai-service.yml/badge.svg)](https://github.com/torillotomas/bioai-hub/actions/workflows/ai-service.yml)
[![Frontend Type Check](https://github.com/torillotomas/bioai-hub/actions/workflows/frontend.yml/badge.svg)](https://github.com/torillotomas/bioai-hub/actions/workflows/frontend.yml)

Platform for medical image analysis using artificial intelligence. Upload a chest X-ray and get an automatic diagnosis in seconds.

**Stack:** React + Vite + TypeScript · NestJS · Python + FastAPI + PyTorch

---

## Architecture

```
Browser (React)
    │  multipart/form-data
    ▼
NestJS Backend (port 3000)
    │  JSON + base64
    ▼
FastAPI AI Service (port 8000)
    │  PIL → Tensor [1,3,224,224]
    ▼
BioAI CNN (PyTorch)
    │  softmax
    ▼
{ prediction, confidence, class_scores }
```

## Project Structure

```
bioai-hub/
├── apps/
│   ├── frontend/        # React + Vite + TypeScript + Tailwind
│   ├── backend/         # NestJS — file handling, validation, HTTP client
│   └── ai-service/      # FastAPI + PyTorch — model inference
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | >= 20 |
| pnpm | >= 9 |
| Python | >= 3.11 |
| Kaggle account | Required for training |

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/torillotomas/bioai-hub.git
cd bioai-hub
```

### 2. Install JS dependencies

```bash
pnpm install
pnpm approve-builds   # approve @nestjs/core and esbuild
```

### 3. Install Python dependencies

```bash
cd apps/ai-service
pip install -r requirements.txt
```

### 4. Configure Kaggle API

Create `~/.kaggle/kaggle.json`:
```json
{"username": "your_username", "key": "your_api_key"}
```

Get your API key at [kaggle.com](https://www.kaggle.com) → Settings → API → Create New Token.

### 5. Train the model

```bash
cd apps/ai-service
python scripts/train.py --samples-per-class 700 --epochs 8
```

Downloads the [Chest X-Ray dataset](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia) (~2GB) and saves `models/model.pth`.

Training output example:
```
  Epoch [8/8] | Val Acc: 81.2%
  [checkpoint] Best model saved → models/model.pth
```

## Running the services

Open **3 terminals**:

```bash
# Terminal A — AI Service
cd apps/ai-service
uvicorn app.main:app --port 8000 --reload
```

```bash
# Terminal B — Backend
cd apps/backend
pnpm run dev
```

```bash
# Terminal C — Frontend
cd apps/frontend
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1. Drag and drop a chest X-ray image (JPEG, PNG or WebP, max 10MB)
2. Enter a patient ID and select the study type
3. Click **"Analizar imagen"**
4. View the diagnosis with confidence score and probability distribution

## API Reference

### `GET /api/v1/health`
```json
{ "status": "ok", "service": "bioai-backend", "timestamp": "..." }
```

### `POST /api/v1/analysis`
```
Content-Type: multipart/form-data
file:     <image binary>
metadata: { "patientId": "PAC-001", "studyType": "chest_xray" }
```

Response:
```json
{
  "analysis_id": "uuid",
  "status": "completed",
  "result": {
    "prediction": "NORMAL",
    "confidence": 0.91,
    "class_scores": { "NORMAL": 0.91, "PNEUMONIA": 0.09 },
    "model_version": "v1.0.0",
    "inference_time_ms": 80
  },
  "audit": {
    "processed_at": "2026-05-29T16:00:00.000Z",
    "node_version": "v22.x",
    "image_hash_sha256": "abc123..."
  }
}
```

### Error responses

| Status | Cause |
|---|---|
| 400 | Missing file or invalid metadata |
| 413 | File exceeds 10MB limit |
| 415 | Unsupported file type (not JPEG/PNG/WebP) |
| 503 | AI service unavailable |

## Model

- **Architecture:** Custom CNN — 3 convolutional blocks + fully connected classifier
- **Input:** RGB image resized to 224×224
- **Classes:** NORMAL · PNEUMONIA
- **Dataset:** [Chest X-Ray Images (Pneumonia)](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia) — 5,863 images
- **Validation accuracy:** ~81%

> **Disclaimer:** This model is built for educational purposes only. It does not replace professional medical diagnosis.

## Running tests

```bash
# AI Service
cd apps/ai-service
pytest tests/ -v
```

## Docker (optional)

```bash
docker compose up
```

---

Built with the [BioAI Hub Implementation Plan](PLAN_IMPLEMENTACION.md) · 4 milestones · 1 day
