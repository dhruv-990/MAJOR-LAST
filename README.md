# 🛰️ Outage Sense – Predictive Cloud Monitoring System

A full-stack predictive monitoring platform for Kubernetes-based cloud services. The system collects infrastructure metrics, analyses them using Isolation Forest anomaly detection, and triggers multi-channel alerts when potential outages are predicted.

---

## 📋 Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [ML Service](#ml-service)
- [Monitoring](#monitoring)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Configuration](#configuration)
- [Screenshots](#screenshots)

---

## 🏗️ Architecture

```
┌────────────┐    ┌────────────┐    ┌────────────┐
│  Frontend   │◄──│  Backend   │◄──│  ML Service │
│  React.js   │   │  Express   │   │  Flask      │
│  Port 3000  │   │  Port 5000 │   │  Port 5001  │
└────────────┘    └──────┬─────┘    └────────────┘
                         │
                    ┌────┴────┐
                    │ MongoDB │
                    │  27017  │
                    └─────────┘
       ┌────────────┐    ┌──────────────┐
       │ Prometheus  │◄──│ Node Exporter │
       │   9090      │   │    9100       │
       └────────────┘    └──────────────┘
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, TailwindCSS, Chart.js, Axios, React Router |
| Backend | Node.js, Express, MongoDB, Mongoose, Nodemailer, Node-cron |
| ML Service | Python, Flask, Scikit-learn (Isolation Forest), Pandas, Joblib |
| Monitoring | Prometheus, Node Exporter |
| Containerization | Docker, Docker Compose |
| Orchestration | Kubernetes |

---

## 📁 Project Structure

```
outage-sense/
├── frontend/                  # React dashboard
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── MetricsChart.js
│   │   │   ├── AlertList.js
│   │   │   ├── PodStatus.js
│   │   │   ├── Sidebar.js
│   │   │   ├── Header.js
│   │   │   └── AnomalyPanel.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── backend/                   # Node.js API
│   ├── routes/
│   │   ├── metricRoutes.js
│   │   ├── alertRoutes.js
│   │   ├── podRoutes.js
│   │   └── predictRoutes.js
│   ├── models/
│   │   ├── Metric.js
│   │   ├── Alert.js
│   │   └── Pod.js
│   ├── services/
│   │   ├── prometheusService.js
│   │   ├── mlService.js
│   │   └── alertService.js
│   ├── server.js
│   └── package.json
│
├── ml-service/                # Python ML service
│   ├── app.py
│   ├── model.py
│   ├── generate_dataset.py
│   └── requirements.txt
│
├── monitoring/
│   └── prometheus.yml
│
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── Dockerfile.ml
│
├── kubernetes/
│   ├── frontend.yaml
│   ├── backend.yaml
│   ├── ml-service.yaml
│   ├── mongodb.yaml
│   ├── prometheus.yaml
│   └── node-exporter.yaml
│
├── scripts/
│   ├── setup.sh
│   └── train_model.sh
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local ML development)

### Run with Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/your-username/outage-sense.git
cd outage-sense

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up --build

# 4. Train the ML model (first time)
curl -X POST http://localhost:5001/train
```

### Access the Application

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| ML Service | http://localhost:5001 |
| Prometheus | http://localhost:9090 |
| Node Exporter | http://localhost:9100 |

---

## 📡 API Reference

### Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics` | List latest metrics |
| GET | `/api/metrics/latest` | Get most recent snapshot |
| GET | `/api/metrics/history?hours=24` | Historical metrics |
| POST | `/api/metrics` | Store a metric record |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | List alerts (filterable) |
| GET | `/api/alerts/stats` | Alert statistics |
| PUT | `/api/alerts/:id/acknowledge` | Acknowledge an alert |
| DELETE | `/api/alerts/:id` | Delete an alert |

### Pods

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pods` | List all pods |
| GET | `/api/pods/summary` | Pod health summary |
| POST | `/api/pods` | Register/update a pod |

### Predictions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predict` | Run anomaly prediction |
| POST | `/api/predict/train` | Train the ML model |
| GET | `/api/predict/health` | ML service health check |

---

## 🤖 ML Service

The ML service uses **Isolation Forest** for unsupervised anomaly detection.

### Features Analysed

| Feature | Normal Range | Anomalous Range |
|---------|-------------|-----------------|
| CPU Usage | 10–75% | 85–100% |
| Memory Usage | 20–80% | 85–100% |
| Disk Usage | 15–70% | 80–100% |
| Network Latency | 1–100ms | 200–2000ms |
| Pod Restarts | 0–3 | 5–50 |

### Direct API Usage

```bash
# Train the model
curl -X POST http://localhost:5001/train

# Predict anomalies
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"cpu_usage": 95, "memory_usage": 92, "disk_usage": 88, "network_latency": 500, "pod_restarts": 12}'
```

---

## 📊 Monitoring

Prometheus scrapes metrics every **10 seconds** from:

- **Node Exporter** – Host-level CPU, memory, disk, and network metrics
- **Backend** – Application-level metrics exposed at `/metrics`

Access Prometheus UI at: http://localhost:9090

---

## ☸️ Kubernetes Deployment

```bash
# Apply all manifests
kubectl apply -f kubernetes/

# Verify deployments
kubectl get pods
kubectl get services

# Access the frontend
kubectl port-forward svc/frontend 3000:80
```

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `ML_SERVICE_URL` | ML service endpoint |
| `PROMETHEUS_URL` | Prometheus server URL |
| `SMTP_HOST/USER/PASS` | Email alert configuration |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `TELEGRAM_CHAT_ID` | Telegram chat/group ID |

---

## 📸 Features

- **Real-time Monitoring** – Live infrastructure metrics with 10-second refresh
- **Anomaly Detection** – ML-powered prediction using Isolation Forest
- **Multi-channel Alerts** – Email, Telegram, and dashboard notifications
- **Interactive Dashboard** – CPU/memory charts, pod health, alert management
- **Prometheus Integration** – Industry-standard metrics collection
- **Container-ready** – Full Docker Compose and Kubernetes support

---

## 📜 License

This project is licensed under the MIT License.
