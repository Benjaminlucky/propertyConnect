import { Router } from "express";
import { z } from "zod";
import Groq from "groq-sdk";
import { requireAuth } from "../middleware/auth.js";

export const aiRouter = Router();

const DescribeSchema = z.object({
  category:      z.string(),
  neighbourhood: z.string().optional(),
  lga:           z.string().optional(),
  state:         z.string().optional(),
  price:         z.string().optional(),
  period:        z.string().optional(),
  beds:          z.string().optional(),
  baths:         z.string().optional(),
  sqm:           z.string().optional(),
  buildingType:  z.string().optional(),
  furnishing:    z.string().optional(),
  titleType:     z.string().optional(),
  plotSize:      z.string().optional(),
  plotUnit:      z.string().optional(),
  floorArea:     z.string().optional(),
  condition:     z.string().optional(),
  capacity:      z.string().optional(),
  venueType:     z.string().optional(),
  features:      z.array(z.string()).max(20).optional(),
});

type DescribeInput = z.infer<typeof DescribeSchema>;

const CAT_LABEL: Record<string, string> = {
  "for-sale":    "residential property for sale",
  "for-rent":    "residential property for rent",
  "short-let":   "short-let / serviced apartment",
  "office":      "office space",
  "retail":      "retail / shop space",
  "warehouse":   "warehouse / storage facility",
  "land":        "land plot",
  "event-venue": "event venue",
};

function buildPrompt(d: DescribeInput): string {
  const lines: string[] = [
    `Type: ${CAT_LABEL[d.category] ?? d.category}`,
  ];

  const location = [d.neighbourhood, d.lga, d.state].filter(Boolean).join(", ");
  if (location) lines.push(`Location: ${location}`);
  if (d.price)        lines.push(`Price: ₦${d.price}${d.period ? ` ${d.period.toLowerCase()}` : ""}`);
  if (d.buildingType) lines.push(`Building type: ${d.buildingType}`);
  if (d.beds)         lines.push(`Bedrooms: ${d.beds}`);
  if (d.baths)        lines.push(`Bathrooms: ${d.baths}`);
  if (d.sqm)          lines.push(`Total area: ${d.sqm} sqm`);
  if (d.furnishing)   lines.push(`Furnishing: ${d.furnishing}`);
  if (d.titleType)    lines.push(`Land title: ${d.titleType}`);
  if (d.plotSize)     lines.push(`Plot size: ${d.plotSize} ${d.plotUnit ?? "sqm"}`);
  if (d.floorArea)    lines.push(`Floor area: ${d.floorArea} sqm`);
  if (d.condition)    lines.push(`Condition: ${d.condition}`);
  if (d.capacity)     lines.push(`Venue capacity: ${d.capacity} guests`);
  if (d.venueType)    lines.push(`Venue type: ${d.venueType}`);
  if (d.features?.length) lines.push(`Key features: ${d.features.join(", ")}`);

  return `You are a professional Nigerian real estate copywriter. Write a compelling listing description for the property below.

Requirements:
- 180–260 words
- Open with a lifestyle hook about the location or the property's standout quality — draw the reader in
- Weave key features into natural sentences, never use bullet points
- Mention the neighbourhood specifically and what makes it desirable (proximity to landmarks, lifestyle, demand)
- Warm, professional English — the tone of a trusted Lagos estate agent, not a robot or a tabloid
- Do not mention the price (it is displayed separately on the listing page)
- Close with a single, direct call-to-action sentence
- Plain text only — no markdown, no asterisks, no headers, no bullet points

Property details:
${lines.join("\n")}`;
}

// POST /api/v1/ai/listing-description — authenticated agents only
aiRouter.post("/listing-description", requireAuth, async (req, res) => {
  if (!process.env.GROQ_API_KEY) {
    res.status(503).json({ error: "AI writer is not configured on this server." });
    return;
  }

  const parsed = DescribeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  // Require enough context for the AI to produce a useful description
  if (!parsed.data.category || !parsed.data.state) {
    res.status(422).json({ error: "Please fill in at least the category and state before generating." });
    return;
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: buildPrompt(parsed.data) }],
      max_tokens: 420,
      temperature: 0.72,
    });

    const description = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!description) {
      res.status(500).json({ error: "AI returned an empty response. Please try again." });
      return;
    }

    res.json({ description });
  } catch (err: unknown) {
    console.error("[ai] Groq error:", err);
    res.status(500).json({ error: "AI generation failed. Please try again." });
  }
});
