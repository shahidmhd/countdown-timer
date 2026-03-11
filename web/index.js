// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import mongoose from "mongoose";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import timerRouter from "./ routes/timer.js";
import Timer from "./models/Timer.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);
const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// MongoDB
mongoose
  .connect("mongodb+srv://shahidvk1212_db_user:QvcJc3MtAxwn28DC@cluster0.p9gdba7.mongodb.net/countdown_db?appName=Cluster0")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Shopify auth
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

app.use(express.json());

// Manual CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// PUBLIC route - no auth (widget)
app.get("/api/timers/public/:shop", async (req, res) => {
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

// All routes below need auth
app.use("/api/*", shopify.validateAuthenticatedSession());

// Protected timer routes
app.get("/api/timers", async (req, res) => {
  try {
    const shop = res.locals.shopify.session.shop;
    console.log("✅ GET timers shop:", shop);
    const timers = await Timer.find({ shop }).sort({ createdAt: -1 });
    res.json(timers);
  } catch (err) {
    console.error("❌ GET error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/timers", async (req, res) => {
  try {
    const shop = res.locals.shopify.session.shop;
    console.log("✅ POST timer shop:", shop);
    const timer = await Timer.create({ ...req.body, shop });
    res.json(timer);
  } catch (err) {
    console.error("❌ POST error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/timers/:id", async (req, res) => {
  try {
    const timer = await Timer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(timer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/timers/:id", async (req, res) => {
  try {
    await Timer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
