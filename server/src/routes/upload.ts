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

// Baked into the delivered image at upload time (an "incoming" transformation)
// so every listing photo is watermarked at the source — no reliance on every
// render site remembering to add it. Logo stacked above the site name,
// bottom-right, semi-transparent. Never applied to verification documents
// (NIN/BVN/CAC/REAN/photo-ID uploads use the same endpoint with no purpose
// field, so they stay untouched).
const LISTING_WATERMARK =
  "l_propconnect:watermark_logo,w_44,o_90/fl_layer_apply,g_south_east,x_24,y_66/" +
  "l_text:Arial_26_bold:mypropertyconnect.ng,co_white,o_90/fl_layer_apply,g_south_east,x_24,y_18";

// POST /api/v1/upload/photo — authenticated, returns Cloudinary URL
// Body field "purpose" = "listing" watermarks the photo; anything else
// (or omitted, as with verification document uploads) leaves it untouched.
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

  const watermark = req.body?.purpose === "listing" ? LISTING_WATERMARK : null;

  const ts  = Math.round(Date.now() / 1000);
  const str = watermark
    ? `folder=propconnect&timestamp=${ts}&transformation=${watermark}${apiSecret}`
    : `folder=propconnect&timestamp=${ts}${apiSecret}`;

  const crypto = await import("crypto");
  const sig = crypto.default.createHash("sha1").update(str).digest("hex");

  const form = new FormData();
  form.append("file", new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
  form.append("api_key", apiKey);
  form.append("timestamp", String(ts));
  form.append("signature", sig);
  form.append("folder", "propconnect");
  if (watermark) form.append("transformation", watermark);

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
