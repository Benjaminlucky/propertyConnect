import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import { listingsRouter } from "./routes/listings.js";
import { agentsRouter } from "./routes/agents.js";
import { enquiriesRouter } from "./routes/enquiries.js";
import { uploadRouter } from "./routes/upload.js";
import { authRouter } from "./routes/auth.js";
import { analyticsRouter } from "./routes/analytics.js";
import { aiRouter } from "./routes/ai.js";
import { verifyRouter } from "./routes/verify.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(express.json({ limit: "2mb" }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/listings",   listingsRouter);
app.use("/api/v1/agents",     agentsRouter);
app.use("/api/v1/enquiries",  enquiriesRouter);
app.use("/api/v1/upload",     uploadRouter);
app.use("/api/v1/auth",       authRouter);
app.use("/api/v1/analytics",  analyticsRouter);
app.use("/api/v1/ai",         aiRouter);
app.use("/api/v1/verify",     verifyRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`PropConnect API running on http://localhost:${PORT}`);
});
