import { Router } from "express";
import Timer from "../models/Timer.js";

const router = Router();

// ✅ PUBLIC - Get active timers for a shop (called by Preact widget)
router.get("/api/timers/public/:shop", async (req, res) => {
  try {
    const now = new Date();
    const timers = await Timer.find({
      shop: req.params.shop,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
    res.json(timers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PROTECTED - Get all timers for admin panel
router.get("/api/timers", async (req, res) => {
  try {
    const shop = res.locals.shopify.session.shop;
    const timers = await Timer.find({ shop }).sort({ createdAt: -1 });
    res.json(timers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PROTECTED - Create timer
router.post("/api/timers", async (req, res) => {
  try {
    const shop = res.locals.shopify.session.shop;
    const timer = await Timer.create({ ...req.body, shop });
    res.json(timer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PROTECTED - Update timer
router.put("/api/timers/:id", async (req, res) => {
  try {
    const timer = await Timer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(timer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PROTECTED - Delete timer
router.delete("/api/timers/:id", async (req, res) => {
  try {
    await Timer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;