#!/bin/bash
# ─── Outage Sense – Setup Script ────────────────────────────
set -e

echo "🚀 Setting up Outage Sense…"

# Copy .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies…"
cd backend && npm install && cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies…"
cd frontend && npm install && cd ..

# Install ML dependencies
echo "🐍 Installing ML dependencies…"
cd ml-service && pip install -r requirements.txt && cd ..

# Generate dataset and train model
echo "🤖 Generating dataset and training model…"
cd ml-service && python generate_dataset.py && cd ..

echo ""
echo "✅ Setup complete! Run the project with:"
echo "   docker-compose up --build"
