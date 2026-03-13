const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");

// GET /api/alerts – List alerts (newest first)
router.get("/", async (req, res) => {
  try {
    const { limit = 50, severity, acknowledged } = req.query;
    const filter = {};
    if (severity) filter.severity = severity;
    if (acknowledged !== undefined) filter.acknowledged = acknowledged === "true";

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/alerts/stats – Alert statistics
router.get("/stats", async (_req, res) => {
  try {
    const total = await Alert.countDocuments();
    const unacknowledged = await Alert.countDocuments({ acknowledged: false });
    const critical = await Alert.countDocuments({ severity: "critical" });
    const last24h = await Alert.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 86400000) },
    });
    res.json({ success: true, data: { total, unacknowledged, critical, last24h } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/alerts/:id/acknowledge – Acknowledge alert
router.put("/:id/acknowledge", async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        acknowledged: true,
        acknowledged_by: req.body.acknowledged_by || "admin",
        acknowledged_at: new Date(),
      },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, error: "Alert not found" });
    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/alerts/:id
router.delete("/:id", async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Alert deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
