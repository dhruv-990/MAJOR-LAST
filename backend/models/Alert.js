const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["anomaly", "threshold", "system"],
      default: "anomaly",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "high",
    },
    message: { type: String, required: true },
    metric_snapshot: {
      cpu_usage: Number,
      memory_usage: Number,
      disk_usage: Number,
      network_latency: Number,
      pod_restarts: Number,
      anomaly_score: Number,
    },
    channels_notified: [{ type: String }],
    acknowledged: { type: Boolean, default: false },
    acknowledged_by: { type: String },
    acknowledged_at: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
