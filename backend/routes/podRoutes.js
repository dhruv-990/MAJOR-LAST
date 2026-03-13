const express = require("express");
const router = express.Router();
const Pod = require("../models/Pod");

// GET /api/pods – List all pods
router.get("/", async (_req, res) => {
  try {
    const pods = await Pod.find().sort({ updatedAt: -1 });
    res.json({ success: true, data: pods });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/pods – Register / update a pod
router.post("/", async (req, res) => {
  try {
    const { name, namespace } = req.body;
    const pod = await Pod.findOneAndUpdate(
      { name, namespace: namespace || "default" },
      { ...req.body, last_checked: new Date() },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true, data: pod });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/pods/summary – Pod health summary
router.get("/summary", async (_req, res) => {
  try {
    const total = await Pod.countDocuments();
    const running = await Pod.countDocuments({ status: "Running" });
    const failed = await Pod.countDocuments({ status: "Failed" });
    const pending = await Pod.countDocuments({ status: "Pending" });
    res.json({ success: true, data: { total, running, failed, pending } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/pods/:id
router.delete("/:id", async (req, res) => {
  try {
    await Pod.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Pod removed" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
