FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .

# PyTorch CPU-only (~600MB vs ~3GB CUDA). Must run before the rest of
# requirements.txt so pip sees torch already satisfied and skips it.
RUN pip install --no-cache-dir \
    torch==2.6.0+cpu \
    torchvision==0.21.0+cpu \
    --index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
