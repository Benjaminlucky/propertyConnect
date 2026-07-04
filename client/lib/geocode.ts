export interface GeoPoint {
  lat: number;
  lng: number;
}

// Cascading query: neighbourhood → LGA → state, broadening until we get a hit.
// Results are cached by Next.js fetch() for 24 hours so Nominatim is only
// called once per unique location combination per day.
export async function geocodeNigeria(
  neighbourhood: string,
  lga: string,
  state: string,
): Promise<GeoPoint | null> {
  const queries = [
    [neighbourhood, lga, state, "Nigeria"].filter(Boolean).join(", "),
    [lga, state, "Nigeria"].filter(Boolean).join(", "),
    [state, "Nigeria"].filter(Boolean).join(", "),
  ];

  for (const q of queries) {
    if (!q.trim()) continue;
    try {
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=ng`;
      const res = await fetch(url, {
        headers: {
          // Nominatim policy requires a descriptive User-Agent
          "User-Agent": "PropertyConnect/1.0 (admin@propertyconnect.ng)",
        },
        next: { revalidate: 86400 }, // cache 24 h in the Next.js data cache
      });
      if (!res.ok) continue;
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (data.length) {
        return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
      }
    } catch {
      continue;
    }
  }

  return null;
}
