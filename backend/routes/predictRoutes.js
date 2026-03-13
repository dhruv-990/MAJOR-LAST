const express = require("express");
const router = express.Router();
const mlService = require("../services/mlService");

// POST /api/predict – Send metrics to ML service for prediction
router.post("/", async (req, res) => {
  try {
    const results = await mlService.predict(req.body);
    res.json({ success: true, predictions: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/predict/train – Trigger model training
router.post("/train", async (_req, res) => {
  try {
    const result = await mlService.train();
    res.json({ success: true, training_summary: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/predict/health – Check ML service health
router.get("/health", async (_req, res) => {
  try {
    const health = await mlService.checkHealth();
    res.json({ success: true, ml_service: health });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
