/**
 * ML Service – Proxy to the Python Flask ML microservice
 */

const axios = require("axios");

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://ml-service:5001";

/**
 * Convert raw metrics into ML model input format
 */
function normalizeMetrics(metrics = {}) {
  return {
    cpu_usage: Number(metrics.cpu_usage ?? 0),
    memory_usage: Number(metrics.memory_usage ?? 0),
    disk_usage: Number(metrics.disk_usage ?? 0),
    network_latency: Number(metrics.network_latency ?? 0),
    pod_restarts: Number(metrics.pod_restarts ?? 0),
  };
}

/**
 * Send metrics to the ML service for anomaly prediction
 */
async function predict(metricsData) {
  try {
    const records = Array.isArray(metricsData)
      ? metricsData.map(normalizeMetrics)
      : [normalizeMetrics(metricsData)];

    const response = await axios.post(
      `${ML_SERVICE_URL}/predict`,
      records,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    return response.data.predictions || [];
  } catch (err) {
    console.error(
      "[ML Service] Prediction failed:",
      err.response?.data || err.message
    );
    return [];
  }
}

/**
 * Trigger model training on the ML service
 */
async function train() {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/train`,
      { regenerate_dataset: true },
      { timeout: 60000 }
    );

    console.log("[ML Service] Training completed");
    return response.data.training_summary;
  } catch (err) {
    console.error(
      "[ML Service] Training failed:",
      err.response?.data || err.message
    );
    throw err;
  }
}

/**
 * Health check the ML service
 */
async function checkHealth() {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 5000,
    });

    return response.data;
  } catch (err) {
    console.error(
      "[ML Service] Health check failed:",
      err.response?.data || err.message
    );
    return { status: "unreachable" };
  }
}

module.exports = {
  predict,
  train,
  checkHealth,
};