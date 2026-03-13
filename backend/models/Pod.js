const mongoose = require("mongoose");

const podSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    namespace: { type: String, default: "default" },
    status: {
      type: String,
      enum: ["Running", "Pending", "Failed", "Succeeded", "Unknown"],
      default: "Running",
    },
    restart_count: { type: Number, default: 0 },
    cpu_usage: { type: Number, default: 0 },
    memory_usage: { type: Number, default: 0 },
    node: { type: String },
    last_checked: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pod", podSchema);
