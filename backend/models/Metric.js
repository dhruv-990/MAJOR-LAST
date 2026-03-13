const mongoose = require("mongoose");

const metricSchema = new mongoose.Schema(
  {
    cpu_usage: { type: Number, required: true },
    memory_usage: { type: Number, required: true },
    disk_usage: { type: Number, required: true },
    network_latency: { type: Number, required: true },
    pod_restarts: { type: Number, default: 0 },
    source: { type: String, default: "prometheus" },
    prediction: { type: String, enum: ["normal", "anomaly", "pending"], default: "pending" },
    anomaly_score: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Metric", metricSchema);
