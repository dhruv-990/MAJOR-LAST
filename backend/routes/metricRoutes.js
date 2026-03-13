const express = require("express");
const router = express.Router();
const Metric = require("../models/Metric");

// GET /api/metrics – Fetch latest metrics
router.get("/", async (_req, res) => {
  try {
    const metrics = await Metric.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/metrics/latest – Single latest snapshot
router.get("/latest", async (_req, res) => {
  try {
    const metric = await Metric.findOne().sort({ createdAt: -1 });
    res.json({ success: true, data: metric });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/metrics – Store a new metric record
router.post("/", async (req, res) => {
  try {
    const metric = await Metric.create(req.body);
    res.status(201).json({ success: true, data: metric });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/metrics/history – Time-range query
router.get("/history", async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const metrics = await Metric.find({ createdAt: { $gte: since } }).sort({
      createdAt: 1,
    });
    res.json({ success: true, data: metrics, period_hours: Number(hours) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
