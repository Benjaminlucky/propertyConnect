import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";

export const uploadRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are accepted"));
  },
});

// POST /api/v1/upload/photo — authenticated, returns Cloudinary URL
uploadRouter.post("/photo", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file received" });
    return;
  }

  // Cloudinary upload via REST API (avoids SDK peer-dep issues)
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    res.status(503).json({ error: "Upload service not configured" });
    return;
  }

  const ts  = Math.round(Date.now() / 1000);
  const str = `folder=propconnect&timestamp=${ts}${apiSecret}`;

  const crypto = await import("crypto");
  const sig = crypto.default.createHash("sha1").update(str).digest("hex");

  const form = new FormData();
  form.append("file", new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
  form.append("api_key", apiKey);
  form.append("timestamp", String(ts));
  form.append("signature", sig);
  form.append("folder", "propconnect");

  const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!resp.ok) {
    const err = await resp.text();
    res.status(502).json({ error: "Upload failed", detail: err });
    return;
  }

  const json = (await resp.json()) as { secure_url: string; public_id: string };
  res.json({ url: json.secure_url, publicId: json.public_id });
});
