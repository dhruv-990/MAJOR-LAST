/**
 * Outage Sense – Backend Server
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cron = require("node-cron");

const metricRoutes = require("./routes/metricRoutes");
const alertRoutes = require("./routes/alertRoutes");
const podRoutes = require("./routes/podRoutes");
const predictRoutes = require("./routes/predictRoutes");

const prometheusService = require("./services/prometheusService");
const mlService = require("./services/mlService");
const alertService = require("./services/alertService");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://mongodb:27017/outage-sense";

// ── Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────
app.use("/api/metrics", metricRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/pods", podRoutes);
app.use("/api/predict", predictRoutes);

// ── Health check ─────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "healthy", service: "outage-sense-backend" });
});

// ── Prometheus metrics endpoint (for scraping) ───────────────────
app.get("/metrics", async (_req, res) => {
  try {
    const metrics = await prometheusService.getFormattedMetrics();
    res.set("Content-Type", "text/plain");
    res.send(metrics);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ── Scheduled jobs ───────────────────────────────────────────────
// Collect metrics from Prometheus every 30 seconds
cron.schedule("*/30 * * * * *", async () => {
  try {
    console.log("[CRON] Collecting metrics from Prometheus…");
    const metricsData = await prometheusService.collectMetrics();
    if (metricsData) {
      // Run prediction on collected metrics
      const predictions = await mlService.predict(metricsData);
      if (predictions && predictions.length > 0) {
        const anomalies = predictions.filter(
          (p) => p.prediction === "anomaly"
        );
        if (anomalies.length > 0) {
          console.log(
            `[CRON] 🚨 ${anomalies.length} anomalies detected – triggering alerts`
          );
          await alertService.triggerAlerts(anomalies);
        }
      }
    }
  } catch (err) {
    console.error("[CRON] Error in scheduled metric collection:", err.message);
  }
});

// ── Database & server start ──────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Outage Sense backend listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

module.exports = app;
