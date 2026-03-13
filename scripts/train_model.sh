#!/bin/bash
# ─── Outage Sense – Train ML Model ──────────────────────────
set -e

echo "🤖 Training Outage Sense ML model…"

cd "$(dirname "$0")/../ml-service"

# Generate fresh dataset
python generate_dataset.py

# Train via API (if service is running) or directly
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
  echo "📡 ML service is running – training via API…"
  curl -X POST http://localhost:5001/train \
    -H "Content-Type: application/json" \
    -d '{"regenerate_dataset": true}'
  echo ""
else
  echo "📦 ML service not running – training locally…"
  python -c "
import pandas as pd
from model import train_model
data = pd.read_csv('data/metrics_dataset.csv')
result = train_model(data)
print('✅ Training complete:', result)
"
fi

echo "✅ Model training finished!"
