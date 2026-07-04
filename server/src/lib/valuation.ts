import Groq from "groq-sdk";

export interface ValuationResult {
  low:  string;
  high: string;
  note: string;
}

interface ValuationInput {
  category_slug: string;
  neighbourhood: string;
  lga:           string;
  state:         string;
  price:         number;
  period:        string;
  beds:          number;
}

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

export async function generateValuation(
  input: ValuationInput
): Promise<ValuationResult | null> {
  if (!process.env.GROQ_API_KEY) return null;

  const location      = [input.neighbourhood, input.lga, input.state].filter(Boolean).join(", ");
  const priceFormatted = `₦${Number(input.price).toLocaleString("en-NG")}${input.period ? " " + input.period : ""}`;
  const bedsLine      = input.beds > 0 ? `\n- Bedrooms: ${input.beds}` : "";

  const prompt = `You are a Nigerian real estate analyst. Estimate the fair market value range for this property.

Return ONLY valid JSON with these exact keys — no other text:
{"low":"₦...","high":"₦...","note":"..."}

Rules:
- For sale: express range in Naira (e.g. "₦120m", "₦85,000,000")
- For rent/short-let: use same period as listed price (e.g. "₦3.5m/year", "₦65k/night")
- "note": ONE sentence — mention comparable data source, 90-day window, confidence (high/medium/low). Max 50 words.

Property:
- Type: ${CAT_LABEL[input.category_slug] ?? input.category_slug}
- Location: ${location}
- Listed: ${priceFormatted}${bedsLine}`;

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model:           "llama-3.3-70b-versatile",
      messages:        [{ role: "user", content: prompt }],
      max_tokens:      160,
      temperature:     0.2,
      response_format: { type: "json_object" },
    });

    const raw    = completion.choices[0]?.message?.content?.trim() ?? "";
    const parsed = JSON.parse(raw) as { low?: string; high?: string; note?: string };
    if (!parsed.low || !parsed.high || !parsed.note) return null;
    return { low: parsed.low, high: parsed.high, note: parsed.note };
  } catch {
    return null;
  }
}
