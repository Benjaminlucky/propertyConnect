import { MarketId } from "./markets";

export interface Listing {
  id: number;
  marketId: MarketId;
  category: string;       // display label, e.g. "For Sale"
  categorySlug: string;   // URL segment, e.g. "for-sale"
  title: string;
  neighbourhood: string;
  lga: string;
  state: string;
  price: string;          // pre-formatted, e.g. "₦85,000,000"
  period: string;         // "", "/year", "/night", "/day"
  beds: number;           // 0 for non-residential
  baths: number;
  toilets: number;
  agent: string;
  agentInitials: string;
  agentSlug: string;      // matches agents.ts slug
  verified: boolean;
  description?: string;
  photos?: string[];
  valuationLow?: string;
  valuationHigh?: string;
  valuationNote?: string;
}

export const LISTINGS: Listing[] = [
  // ─── Original seed listings ───────────────────────────────────────────────
  {
    id: 3531456,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "Contemporary 5-bedroom semi-detached duplex",
    neighbourhood: "Ikate",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦900,000,000",
    period: "",
    beds: 5, baths: 5, toilets: 6,
    agent: "Chidi Okonkwo",
    agentInitials: "CO",
    agentSlug: "chidi-okonkwo",
    verified: true,
  },
  {
    id: 3531459,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "Brand new 4-bedroom fully detached duplex with BQ",
    neighbourhood: "Gwarinpa",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦130,000,000",
    period: "",
    beds: 4, baths: 5, toilets: 5,
    agent: "Amaka Eze",
    agentInitials: "AE",
    agentSlug: "amaka-eze",
    verified: true,
  },
  {
    id: 3531460,
    marketId: "ng",
    category: "For Rent",
    categorySlug: "for-rent",
    title: "Lovely 3-bedroom flat with a room BQ",
    neighbourhood: "GRA",
    lga: "Port Harcourt",
    state: "Rivers",
    price: "₦10,000,000",
    period: "/year",
    beds: 3, baths: 3, toilets: 4,
    agent: "Tunde Bello",
    agentInitials: "TB",
    agentSlug: "tunde-bello",
    verified: true,
  },
  {
    id: 3531458,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "Mini flat (room & parlour) — LSDPC bungalow",
    neighbourhood: "Bodija",
    lga: "Ibadan North",
    state: "Oyo",
    price: "₦45,000,000",
    period: "",
    beds: 1, baths: 1, toilets: 1,
    agent: "Ngozi Adaobi",
    agentInitials: "NA",
    agentSlug: "ngozi-adaobi",
    verified: false,
  },
  {
    id: 3531471,
    marketId: "ng",
    category: "Short-let",
    categorySlug: "short-let",
    title: "Serviced 2-bed apartment, fast wifi & power",
    neighbourhood: "Victoria Island",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦85,000",
    period: "/night",
    beds: 2, baths: 2, toilets: 2,
    agent: "Lagos Stays",
    agentInitials: "LS",
    agentSlug: "lagos-stays",
    verified: true,
  },
  {
    id: 3531480,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "5-bedroom terraced duplex in gated estate",
    neighbourhood: "Maitama",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦210,000,000",
    period: "",
    beds: 5, baths: 5, toilets: 6,
    agent: "Chidi Okonkwo",
    agentInitials: "CO",
    agentSlug: "chidi-okonkwo",
    verified: true,
  },

  // ─── For Sale — Lagos ─────────────────────────────────────────────────────
  {
    id: 3531481,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "Luxury 3-bedroom apartment with pool access and 24hr power",
    neighbourhood: "Lekki Phase 1",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦85,000,000",
    period: "",
    beds: 3, baths: 3, toilets: 4,
    agent: "Kemi Adeleke",
    agentInitials: "KA",
    agentSlug: "kemi-adeleke",
    verified: true,
  },
  {
    id: 3531482,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "4-bedroom fully detached house — private compound, ocean view",
    neighbourhood: "Ikoyi",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦380,000,000",
    period: "",
    beds: 4, baths: 5, toilets: 6,
    agent: "Chidi Okonkwo",
    agentInitials: "CO",
    agentSlug: "chidi-okonkwo",
    verified: true,
  },
  {
    id: 3531483,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "2-bedroom flat in gated estate, excellent security",
    neighbourhood: "Ajah",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦26,000,000",
    period: "",
    beds: 2, baths: 2, toilets: 3,
    agent: "Bola Adesanya",
    agentInitials: "BA",
    agentSlug: "bola-adesanya",
    verified: true,
  },
  {
    id: 3531484,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "5-bedroom detached mansion with BQ, gym, and swimming pool",
    neighbourhood: "Magodo Phase 2",
    lga: "Kosofe",
    state: "Lagos",
    price: "₦135,000,000",
    period: "",
    beds: 5, baths: 6, toilets: 7,
    agent: "Gbenga Fashola",
    agentInitials: "GF",
    agentSlug: "gbenga-fashola",
    verified: true,
  },
  {
    id: 3531485,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "3-bedroom terrace duplex in a serene estate",
    neighbourhood: "GRA Ikeja",
    lga: "Ikeja",
    state: "Lagos",
    price: "₦62,000,000",
    period: "",
    beds: 3, baths: 4, toilets: 4,
    agent: "Gbenga Fashola",
    agentInitials: "GF",
    agentSlug: "gbenga-fashola",
    verified: false,
  },

  // ─── For Sale — Abuja ─────────────────────────────────────────────────────
  {
    id: 3531486,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "4-bedroom fully detached duplex with BQ and solar backup",
    neighbourhood: "Maitama",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦220,000,000",
    period: "",
    beds: 4, baths: 5, toilets: 5,
    agent: "Fatima Musa",
    agentInitials: "FM",
    agentSlug: "fatima-musa",
    verified: true,
  },
  {
    id: 3531487,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "3-bedroom terrace on a quiet street with good road access",
    neighbourhood: "Gwarinpa",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦72,000,000",
    period: "",
    beds: 3, baths: 4, toilets: 4,
    agent: "Amaka Eze",
    agentInitials: "AE",
    agentSlug: "amaka-eze",
    verified: true,
  },
  {
    id: 3531488,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "3-bedroom luxury apartment with Jabi Lake views",
    neighbourhood: "Jabi",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦88,000,000",
    period: "",
    beds: 3, baths: 3, toilets: 4,
    agent: "Amaka Eze",
    agentInitials: "AE",
    agentSlug: "amaka-eze",
    verified: true,
  },

  // ─── For Sale — Rivers ────────────────────────────────────────────────────
  {
    id: 3531489,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "4-bedroom detached house in the heart of GRA",
    neighbourhood: "GRA",
    lga: "Port Harcourt",
    state: "Rivers",
    price: "₦95,000,000",
    period: "",
    beds: 4, baths: 4, toilets: 5,
    agent: "Tunde Bello",
    agentInitials: "TB",
    agentSlug: "tunde-bello",
    verified: true,
  },

  // ─── For Sale — Oyo ──────────────────────────────────────────────────────
  {
    id: 3531490,
    marketId: "ng",
    category: "For Sale",
    categorySlug: "for-sale",
    title: "3-bedroom bungalow in a quiet residential street",
    neighbourhood: "Bodija",
    lga: "Ibadan North",
    state: "Oyo",
    price: "₦32,000,000",
    period: "",
    beds: 3, baths: 2, toilets: 3,
    agent: "Ngozi Adaobi",
    agentInitials: "NA",
    agentSlug: "ngozi-adaobi",
    verified: false,
  },

  // ─── For Rent — Lagos ─────────────────────────────────────────────────────
  {
    id: 3531491,
    marketId: "ng",
    category: "For Rent",
    categorySlug: "for-rent",
    title: "3-bedroom flat with BQ in a managed estate",
    neighbourhood: "Lekki Phase 1",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦6,500,000",
    period: "/year",
    beds: 3, baths: 3, toilets: 4,
    agent: "Kemi Adeleke",
    agentInitials: "KA",
    agentSlug: "kemi-adeleke",
    verified: true,
  },
  {
    id: 3531492,
    marketId: "ng",
    category: "For Rent",
    categorySlug: "for-rent",
    title: "2-bedroom flat, top floor, close to UniLag gate",
    neighbourhood: "Yaba",
    lga: "Lagos Mainland",
    state: "Lagos",
    price: "₦1,800,000",
    period: "/year",
    beds: 2, baths: 2, toilets: 2,
    agent: "Bola Adesanya",
    agentInitials: "BA",
    agentSlug: "bola-adesanya",
    verified: true,
  },
  {
    id: 3531493,
    marketId: "ng",
    category: "For Rent",
    categorySlug: "for-rent",
    title: "Self-contain studio, tiled floor, water heater included",
    neighbourhood: "Surulere",
    lga: "Surulere",
    state: "Lagos",
    price: "₦500,000",
    period: "/year",
    beds: 1, baths: 1, toilets: 1,
    agent: "Bola Adesanya",
    agentInitials: "BA",
    agentSlug: "bola-adesanya",
    verified: false,
  },
  {
    id: 3531494,
    marketId: "ng",
    category: "For Rent",
    categorySlug: "for-rent",
    title: "4-bedroom duplex, fully furnished, prime Victoria Island",
    neighbourhood: "Victoria Island",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦12,000,000",
    period: "/year",
    beds: 4, baths: 4, toilets: 5,
    agent: "Chidi Okonkwo",
    agentInitials: "CO",
    agentSlug: "chidi-okonkwo",
    verified: true,
  },
  {
    id: 3531495,
    marketId: "ng",
    category: "For Rent",
    categorySlug: "for-rent",
    title: "2-bedroom apartment with parking, Gbagada estate",
    neighbourhood: "Gbagada",
    lga: "Shomolu",
    state: "Lagos",
    price: "₦2,200,000",
    period: "/year",
    beds: 2, baths: 2, toilets: 3,
    agent: "Emeka Obi",
    agentInitials: "EO",
    agentSlug: "emeka-obi",
    verified: true,
  },
  {
    id: 3531496,
    marketId: "ng",
    category: "For Rent",
    categorySlug: "for-rent",
    title: "1-bedroom mini flat, newly renovated, generator included",
    neighbourhood: "Ikate",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦1,200,000",
    period: "/year",
    beds: 1, baths: 1, toilets: 1,
    agent: "Kemi Adeleke",
    agentInitials: "KA",
    agentSlug: "kemi-adeleke",
    verified: true,
  },
  {
    id: 3531497,
    marketId: "ng",
    category: "For Rent",
    categorySlug: "for-rent",
    title: "3-bedroom flat with excellent road access and gated security",
    neighbourhood: "Chevron",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦4,500,000",
    period: "/year",
    beds: 3, baths: 3, toilets: 3,
    agent: "Emeka Obi",
    agentInitials: "EO",
    agentSlug: "emeka-obi",
    verified: true,
  },

  // ─── For Rent — Abuja ─────────────────────────────────────────────────────
  {
    id: 3531498,
    marketId: "ng",
    category: "For Rent",
    categorySlug: "for-rent",
    title: "3-bedroom flat with BQ, spacious compound in Gwarinpa",
    neighbourhood: "Gwarinpa",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦2,500,000",
    period: "/year",
    beds: 3, baths: 3, toilets: 4,
    agent: "Fatima Musa",
    agentInitials: "FM",
    agentSlug: "fatima-musa",
    verified: true,
  },
  {
    id: 3531499,
    marketId: "ng",
    category: "For Rent",
    categorySlug: "for-rent",
    title: "2-bedroom apartment, fully tiled, Utako district",
    neighbourhood: "Utako",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦2,000,000",
    period: "/year",
    beds: 2, baths: 2, toilets: 2,
    agent: "Amaka Eze",
    agentInitials: "AE",
    agentSlug: "amaka-eze",
    verified: true,
  },
  {
    id: 3531500,
    marketId: "ng",
    category: "For Rent",
    categorySlug: "for-rent",
    title: "4-bedroom duplex in a well-secured Maitama estate",
    neighbourhood: "Maitama",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦8,000,000",
    period: "/year",
    beds: 4, baths: 4, toilets: 5,
    agent: "Fatima Musa",
    agentInitials: "FM",
    agentSlug: "fatima-musa",
    verified: true,
  },
  {
    id: 3531501,
    marketId: "ng",
    category: "For Rent",
    categorySlug: "for-rent",
    title: "3-bedroom flat on Aminu Kano Crescent, walk to Banex",
    neighbourhood: "Wuse 2",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦4,500,000",
    period: "/year",
    beds: 3, baths: 3, toilets: 3,
    agent: "Amaka Eze",
    agentInitials: "AE",
    agentSlug: "amaka-eze",
    verified: false,
  },

  // ─── For Rent — Rivers ────────────────────────────────────────────────────
  {
    id: 3531502,
    marketId: "ng",
    category: "For Rent",
    categorySlug: "for-rent",
    title: "3-bedroom flat with parking and borehole, Rumuola",
    neighbourhood: "Rumuola",
    lga: "Port Harcourt",
    state: "Rivers",
    price: "₦2,800,000",
    period: "/year",
    beds: 3, baths: 2, toilets: 3,
    agent: "Tunde Bello",
    agentInitials: "TB",
    agentSlug: "tunde-bello",
    verified: true,
  },

  // ─── Short-let ────────────────────────────────────────────────────────────
  {
    id: 3531503,
    marketId: "ng",
    category: "Short-let",
    categorySlug: "short-let",
    title: "2-bedroom serviced apartment — Netflix, workspace, fast wifi",
    neighbourhood: "Lekki Phase 1",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦75,000",
    period: "/night",
    beds: 2, baths: 2, toilets: 2,
    agent: "Kemi Adeleke",
    agentInitials: "KA",
    agentSlug: "kemi-adeleke",
    verified: true,
  },
  {
    id: 3531504,
    marketId: "ng",
    category: "Short-let",
    categorySlug: "short-let",
    title: "Studio apartment — city view, self check-in, 24hr power",
    neighbourhood: "Victoria Island",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦55,000",
    period: "/night",
    beds: 1, baths: 1, toilets: 1,
    agent: "Lagos Stays",
    agentInitials: "LS",
    agentSlug: "lagos-stays",
    verified: true,
  },
  {
    id: 3531505,
    marketId: "ng",
    category: "Short-let",
    categorySlug: "short-let",
    title: "3-bedroom apartment with Jabi Lake views — corporate ready",
    neighbourhood: "Jabi",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦45,000",
    period: "/night",
    beds: 3, baths: 3, toilets: 3,
    agent: "Fatima Musa",
    agentInitials: "FM",
    agentSlug: "fatima-musa",
    verified: true,
  },
  {
    id: 3531506,
    marketId: "ng",
    category: "Short-let",
    categorySlug: "short-let",
    title: "1-bedroom apartment near UniLag — ideal for academics & visits",
    neighbourhood: "Yaba",
    lga: "Lagos Mainland",
    state: "Lagos",
    price: "₦22,000",
    period: "/night",
    beds: 1, baths: 1, toilets: 1,
    agent: "Lagos Stays",
    agentInitials: "LS",
    agentSlug: "lagos-stays",
    verified: false,
  },
  {
    id: 3531507,
    marketId: "ng",
    category: "Short-let",
    categorySlug: "short-let",
    title: "2-bedroom luxury short-let, Landmark Beach corridor",
    neighbourhood: "Ikate",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦65,000",
    period: "/night",
    beds: 2, baths: 2, toilets: 2,
    agent: "Lagos Stays",
    agentInitials: "LS",
    agentSlug: "lagos-stays",
    verified: true,
  },
  {
    id: 3531508,
    marketId: "ng",
    category: "Short-let",
    categorySlug: "short-let",
    title: "3-bedroom penthouse apartment, Ikoyi — pool, gym, concierge",
    neighbourhood: "Ikoyi",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦120,000",
    period: "/night",
    beds: 3, baths: 3, toilets: 4,
    agent: "Chidi Okonkwo",
    agentInitials: "CO",
    agentSlug: "chidi-okonkwo",
    verified: true,
  },
  {
    id: 3531509,
    marketId: "ng",
    category: "Short-let",
    categorySlug: "short-let",
    title: "1-bedroom cosy apartment, Gwarinpa — perfect for business trips",
    neighbourhood: "Gwarinpa",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦25,000",
    period: "/night",
    beds: 1, baths: 1, toilets: 1,
    agent: "Amaka Eze",
    agentInitials: "AE",
    agentSlug: "amaka-eze",
    verified: true,
  },

  // ─── Office Space ─────────────────────────────────────────────────────────
  {
    id: 3531510,
    marketId: "ng",
    category: "Office",
    categorySlug: "office",
    title: "Open plan office — 200sqm, generator, parking, fitted out",
    neighbourhood: "Victoria Island",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦9,000,000",
    period: "/year",
    beds: 0, baths: 0, toilets: 0,
    agent: "Emeka Obi",
    agentInitials: "EO",
    agentSlug: "emeka-obi",
    verified: true,
  },
  {
    id: 3531511,
    marketId: "ng",
    category: "Office",
    categorySlug: "office",
    title: "Serviced office suite — reception, boardroom, 24hr power",
    neighbourhood: "Wuse 2",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦5,500,000",
    period: "/year",
    beds: 0, baths: 0, toilets: 0,
    agent: "Amaka Eze",
    agentInitials: "AE",
    agentSlug: "amaka-eze",
    verified: true,
  },
  {
    id: 3531512,
    marketId: "ng",
    category: "Office",
    categorySlug: "office",
    title: "Co-working desks in tech hub — fast fibre, event space access",
    neighbourhood: "Yaba",
    lga: "Lagos Mainland",
    state: "Lagos",
    price: "₦1,500,000",
    period: "/year",
    beds: 0, baths: 0, toilets: 0,
    agent: "Emeka Obi",
    agentInitials: "EO",
    agentSlug: "emeka-obi",
    verified: false,
  },
  {
    id: 3531513,
    marketId: "ng",
    category: "Office",
    categorySlug: "office",
    title: "Full floor plate — 350sqm, Lekki Phase 1, shell & core",
    neighbourhood: "Lekki Phase 1",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦14,000,000",
    period: "/year",
    beds: 0, baths: 0, toilets: 0,
    agent: "Emeka Obi",
    agentInitials: "EO",
    agentSlug: "emeka-obi",
    verified: true,
  },
  {
    id: 3531514,
    marketId: "ng",
    category: "Office",
    categorySlug: "office",
    title: "Partitioned office — 120sqm, 5 mins from airport, furnished",
    neighbourhood: "GRA Ikeja",
    lga: "Ikeja",
    state: "Lagos",
    price: "₦4,200,000",
    period: "/year",
    beds: 0, baths: 0, toilets: 0,
    agent: "Gbenga Fashola",
    agentInitials: "GF",
    agentSlug: "gbenga-fashola",
    verified: true,
  },

  // ─── Retail & Shops ───────────────────────────────────────────────────────
  {
    id: 3531515,
    marketId: "ng",
    category: "Retail",
    categorySlug: "retail",
    title: "Shopping mall unit — 80sqm, Circle Mall Lekki, high footfall",
    neighbourhood: "Lekki Phase 1",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦12,000,000",
    period: "/year",
    beds: 0, baths: 0, toilets: 0,
    agent: "Emeka Obi",
    agentInitials: "EO",
    agentSlug: "emeka-obi",
    verified: true,
  },
  {
    id: 3531516,
    marketId: "ng",
    category: "Retail",
    categorySlug: "retail",
    title: "Standalone shop — busy Surulere street, loading bay available",
    neighbourhood: "Surulere",
    lga: "Surulere",
    state: "Lagos",
    price: "₦1,800,000",
    period: "/year",
    beds: 0, baths: 0, toilets: 0,
    agent: "Bola Adesanya",
    agentInitials: "BA",
    agentSlug: "bola-adesanya",
    verified: true,
  },
  {
    id: 3531517,
    marketId: "ng",
    category: "Retail",
    categorySlug: "retail",
    title: "Prime showroom — Adeola Odeku Street, 5m frontage",
    neighbourhood: "Victoria Island",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦8,500,000",
    period: "/year",
    beds: 0, baths: 0, toilets: 0,
    agent: "Emeka Obi",
    agentInitials: "EO",
    agentSlug: "emeka-obi",
    verified: true,
  },

  // ─── Warehouses ───────────────────────────────────────────────────────────
  {
    id: 3531518,
    marketId: "ng",
    category: "Warehouse",
    categorySlug: "warehouse",
    title: "Storage warehouse — 1,200sqm, 2 dock doors, 24hr security",
    neighbourhood: "Trans Amadi",
    lga: "Port Harcourt",
    state: "Rivers",
    price: "₦4,500,000",
    period: "/year",
    beds: 0, baths: 0, toilets: 0,
    agent: "Tunde Bello",
    agentInitials: "TB",
    agentSlug: "tunde-bello",
    verified: true,
  },
  {
    id: 3531519,
    marketId: "ng",
    category: "Warehouse",
    categorySlug: "warehouse",
    title: "Logistics hub — 2,500sqm, Apapa, close to port",
    neighbourhood: "Apapa",
    lga: "Apapa",
    state: "Lagos",
    price: "₦9,000,000",
    period: "/year",
    beds: 0, baths: 0, toilets: 0,
    agent: "Gbenga Fashola",
    agentInitials: "GF",
    agentSlug: "gbenga-fashola",
    verified: false,
  },
  {
    id: 3531520,
    marketId: "ng",
    category: "Warehouse",
    categorySlug: "warehouse",
    title: "Cold storage facility — 600sqm, temperature-controlled",
    neighbourhood: "Rumuola",
    lga: "Port Harcourt",
    state: "Rivers",
    price: "₦6,000,000",
    period: "/year",
    beds: 0, baths: 0, toilets: 0,
    agent: "Tunde Bello",
    agentInitials: "TB",
    agentSlug: "tunde-bello",
    verified: true,
  },

  // ─── Land ─────────────────────────────────────────────────────────────────
  {
    id: 3531521,
    marketId: "ng",
    category: "Land",
    categorySlug: "land",
    title: "450sqm residential plot — C of O, road access, Ajah",
    neighbourhood: "Ajah",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦22,000,000",
    period: "",
    beds: 0, baths: 0, toilets: 0,
    agent: "Bola Adesanya",
    agentInitials: "BA",
    agentSlug: "bola-adesanya",
    verified: true,
  },
  {
    id: 3531522,
    marketId: "ng",
    category: "Land",
    categorySlug: "land",
    title: "600sqm plot — fast-growing Sangotedo area, survey available",
    neighbourhood: "Sangotedo",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦14,000,000",
    period: "",
    beds: 0, baths: 0, toilets: 0,
    agent: "Bola Adesanya",
    agentInitials: "BA",
    agentSlug: "bola-adesanya",
    verified: false,
  },
  {
    id: 3531523,
    marketId: "ng",
    category: "Land",
    categorySlug: "land",
    title: "800sqm residential plot — C of O, Gwarinpa District",
    neighbourhood: "Gwarinpa",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦35,000,000",
    period: "",
    beds: 0, baths: 0, toilets: 0,
    agent: "Amaka Eze",
    agentInitials: "AE",
    agentSlug: "amaka-eze",
    verified: true,
  },
  {
    id: 3531524,
    marketId: "ng",
    category: "Land",
    categorySlug: "land",
    title: "1,200sqm plot — Bodija, Governor's Consent, ready to build",
    neighbourhood: "Bodija",
    lga: "Ibadan North",
    state: "Oyo",
    price: "₦18,000,000",
    period: "",
    beds: 0, baths: 0, toilets: 0,
    agent: "Ngozi Adaobi",
    agentInitials: "NA",
    agentSlug: "ngozi-adaobi",
    verified: true,
  },
  {
    id: 3531525,
    marketId: "ng",
    category: "Land",
    categorySlug: "land",
    title: "300sqm plot in Osapa London — fenced, drainage, tarred road",
    neighbourhood: "Osapa London",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦28,000,000",
    period: "",
    beds: 0, baths: 0, toilets: 0,
    agent: "Kemi Adeleke",
    agentInitials: "KA",
    agentSlug: "kemi-adeleke",
    verified: true,
  },

  // ─── Event Venues ─────────────────────────────────────────────────────────
  {
    id: 3531526,
    marketId: "ng",
    category: "Events",
    categorySlug: "event-venue",
    title: "Grand ballroom — 500 seated, AV system, in-house catering",
    neighbourhood: "Victoria Island",
    lga: "Eti-Osa",
    state: "Lagos",
    price: "₦500,000",
    period: "/day",
    beds: 0, baths: 0, toilets: 0,
    agent: "Lagos Stays",
    agentInitials: "LS",
    agentSlug: "lagos-stays",
    verified: true,
  },
  {
    id: 3531527,
    marketId: "ng",
    category: "Events",
    categorySlug: "event-venue",
    title: "Outdoor event space — 300 standing, parking for 80 cars",
    neighbourhood: "GRA Ikeja",
    lga: "Ikeja",
    state: "Lagos",
    price: "₦280,000",
    period: "/day",
    beds: 0, baths: 0, toilets: 0,
    agent: "Gbenga Fashola",
    agentInitials: "GF",
    agentSlug: "gbenga-fashola",
    verified: true,
  },
  {
    id: 3531528,
    marketId: "ng",
    category: "Events",
    categorySlug: "event-venue",
    title: "Hotel conference room — 80 capacity, projector, fibre internet",
    neighbourhood: "Wuse 2",
    lga: "AMAC",
    state: "FCT - Abuja",
    price: "₦180,000",
    period: "/day",
    beds: 0, baths: 0, toilets: 0,
    agent: "Fatima Musa",
    agentInitials: "FM",
    agentSlug: "fatima-musa",
    verified: true,
  },
];

export function listingsForMarket(marketId: MarketId): Listing[] {
  return LISTINGS.filter((l) => l.marketId === marketId);
}

export function listingsByAgent(agentSlug: string): Listing[] {
  return LISTINGS.filter((l) => l.agentSlug === agentSlug);
}

/** Canonical SEO path for a listing (no leading market segment). */
export function listingPath(l: Listing): string {
  const nb  = l.neighbourhood.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const slug = l.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const st  = l.state.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const lga = l.lga.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${l.categorySlug}/${st}/${lga}/${nb}/${slug}-${l.id}`;
}

/** Parse a trailing -<id> off the last path segment, if present. */
export function idFromSlug(seg: string): number | null {
  const m = seg.match(/-(\d+)$/);
  return m ? Number(m[1]) : null;
}

export function getListing(id: number): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}

// ─── Extended detail (listing detail page) ───────────────────────────────────

export const LISTING_DETAIL: Record<
  number,
  {
    pricePerSqm?: string;
    sqm?: number;
    parking?: number;
    description: string;
    attrs: { k: string; v: string }[];
    agentMeta: string;
    agentYears: number;
    agentRating: number;
    agentReviews: number;
    agentPhone: string;
    valuationLow: string;
    valuationHigh: string;
    valuationNote: string;
  }
> = {
  3531456: {
    pricePerSqm: "₦5.6m/sqm",
    sqm: 160,
    parking: 2,
    description:
      "A contemporary 5-bedroom semi-detached duplex in one of Lekki's most sought-after pockets. Each bedroom is en-suite with fitted wardrobes; the ground floor opens into a double-height living space and a fully fitted kitchen. The estate is gated with 24-hour security, treated water, and an estate-managed power arrangement. Title is clean and ready for due diligence.",
    attrs: [
      { k: "Title document",    v: "Governor's Consent" },
      { k: "Completion status", v: "Completed" },
      { k: "Furnishing",        v: "Unfurnished" },
      { k: "Estate",            v: "Gated, serviced" },
      { k: "Power supply",      v: "Estate-managed" },
      { k: "Year built",        v: "2024" },
    ],
    agentMeta: "Premium agent · Lekki & Ikoyi",
    agentYears: 6,
    agentRating: 4.9,
    agentReviews: 37,
    agentPhone: "08034567890",
    valuationLow: "₦820m",
    valuationHigh: "₦940m",
    valuationNote: "Based on 24 comparable Ikate sales · 90-day window · medium confidence. Listed price sits within range.",
  },
  3531459: {
    sqm: 320,
    parking: 3,
    description:
      "A brand new 4-bedroom fully detached duplex on a generous plot in one of Gwarinpa's most established streets. The ground floor includes a formal sitting room, family lounge, fully fitted kitchen, and a dedicated BQ with its own entrance. All four en-suite bedrooms are upstairs with fitted wardrobes. The property has never been occupied and comes with a clean Governor's Consent title.",
    attrs: [
      { k: "Title document",    v: "Governor's Consent" },
      { k: "Completion status", v: "Completed — never occupied" },
      { k: "Furnishing",        v: "Unfurnished" },
      { k: "BQ",                v: "1 room BQ with separate entrance" },
      { k: "Power supply",      v: "AEDC connection + prepaid meter" },
      { k: "Year built",        v: "2024" },
    ],
    agentMeta: "Abuja specialist · Gwarinpa & Maitama",
    agentYears: 5,
    agentRating: 4.8,
    agentReviews: 29,
    agentPhone: "08056781234",
    valuationLow: "₦118m",
    valuationHigh: "₦142m",
    valuationNote: "Based on 11 comparable Gwarinpa 4-bed sales · 90-day window · medium confidence.",
  },
  3531460: {
    sqm: 140,
    parking: 1,
    description:
      "A well-presented 3-bedroom flat with a single-room BQ in Port Harcourt GRA — the city's most desirable address for oil-sector professionals. The flat is on the third floor with good natural light and cross-ventilation. The estate has active security, a borehole, and a shared generator arrangement. Available for immediate occupancy.",
    attrs: [
      { k: "Lease term",     v: "1 year" },
      { k: "Agency fee",     v: "10%" },
      { k: "Service charge", v: "₦300,000/year" },
      { k: "Furnishing",     v: "Unfurnished" },
      { k: "Floor",          v: "3rd floor" },
      { k: "Available from", v: "Immediate" },
    ],
    agentMeta: "Port Harcourt specialist · GRA & Rumuola",
    agentYears: 8,
    agentRating: 4.7,
    agentReviews: 22,
    agentPhone: "08067891234",
    valuationLow: "₦8.5m",
    valuationHigh: "₦11m",
    valuationNote: "Based on 8 comparable GRA rental listings · 90-day window · low confidence (thin data).",
  },
  3531458: {
    sqm: 80,
    parking: 1,
    description:
      "A tidy room-and-parlour flat in a quiet Bodija compound. Tiled throughout, with a shared borehole and a reliable IBEDC prepaid meter. Ideal for a small family or professional couple. The compound has a cooperative security arrangement.",
    attrs: [
      { k: "Title document",    v: "C of O (LSDPC estate)" },
      { k: "Completion status", v: "Completed" },
      { k: "Furnishing",        v: "Unfurnished" },
      { k: "Compound type",     v: "Shared compound" },
      { k: "Year built",        v: "2010" },
    ],
    agentMeta: "Ibadan specialist · Bodija & Ring Road",
    agentYears: 4,
    agentRating: 4.6,
    agentReviews: 14,
    agentPhone: "08012345678",
    valuationLow: "₦38m",
    valuationHigh: "₦52m",
    valuationNote: "Based on 5 comparable Bodija mini-flat sales · 90-day window · low confidence (thin data).",
  },
  3531471: {
    sqm: 100,
    parking: 1,
    description:
      "A fully serviced 2-bedroom apartment on the 5th floor of a premium Victoria Island building. Comes with fast fibre internet (100Mbps), a dedicated workspace, 24-hour inverter/generator power, air conditioning in every room, and Netflix. Ideal for corporate stays, visiting executives, and workcations. Professional cleaning between every guest. Self check-in available.",
    attrs: [
      { k: "Minimum stay",  v: "1 night" },
      { k: "WiFi speed",    v: "100Mbps fibre" },
      { k: "Power",         v: "24hr — inverter + generator" },
      { k: "Amenities",     v: "AC, Netflix, workspace, kitchen" },
      { k: "Check-in",      v: "From 2:00 PM (self check-in)" },
      { k: "Check-out",     v: "By 11:00 AM" },
    ],
    agentMeta: "Short-let specialist · Victoria Island & Lekki",
    agentYears: 4,
    agentRating: 4.8,
    agentReviews: 61,
    agentPhone: "08098765432",
    valuationLow: "₦70k",
    valuationHigh: "₦100k",
    valuationNote: "Based on 22 comparable VI short-let listings · 30-day window · high confidence.",
  },
  3531480: {
    sqm: 400,
    parking: 4,
    description:
      "A 5-bedroom terraced duplex in one of Maitama's most sought-after gated estates, directly accessible from Aguiyi Ironsi Street. The property features a ground-floor guest suite, a chef's kitchen with Italian fittings, a study, and a rooftop terrace. All five bedrooms are en-suite with walk-in wardrobes. The estate has 24-hour security with biometric access control and estate-managed power.",
    attrs: [
      { k: "Title document",    v: "C of O" },
      { k: "Completion status", v: "Completed" },
      { k: "Furnishing",        v: "Unfurnished" },
      { k: "Estate",            v: "Fully gated, biometric access" },
      { k: "Power supply",      v: "Estate-managed 24hr" },
      { k: "Year built",        v: "2023" },
    ],
    agentMeta: "Premium agent · Maitama & Asokoro",
    agentYears: 6,
    agentRating: 4.9,
    agentReviews: 37,
    agentPhone: "08034567890",
    valuationLow: "₦190m",
    valuationHigh: "₦230m",
    valuationNote: "Based on 7 comparable Maitama terrace sales · 90-day window · medium confidence.",
  },
};

// ─── DB row → Listing mapper ─────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  "for-sale":    "For Sale",
  "for-rent":    "For Rent",
  "short-let":   "Short-let",
  "office":      "Office",
  "retail":      "Retail",
  "warehouse":   "Warehouse",
  "land":        "Land",
  "event-venue": "Events",
};

export interface DbListingRow {
  id: number;
  market_id: string;
  category_slug: string;
  title: string;
  neighbourhood: string;
  lga: string;
  state: string;
  price: number;
  period: string;
  beds: number;
  baths: number;
  toilets: number;
  description?: string;
  status: string;
  created_at: string;
  valuation_low?: string | null;
  valuation_high?: string | null;
  valuation_note?: string | null;
  agent_profiles?: {
    name: string;
    initials: string;
    slug: string;
    verified: boolean;
  } | null;
  listing_photos?: { url: string; position: number }[];
}

export function dbRowToListing(row: DbListingRow): Listing {
  const agent = row.agent_profiles;
  const priceNum = Number(row.price);
  const priceFormatted = `₦${priceNum.toLocaleString("en-NG")}`;
  return {
    id:            row.id,
    marketId:      row.market_id,
    category:      CATEGORY_LABELS[row.category_slug] ?? row.category_slug,
    categorySlug:  row.category_slug,
    title:         row.title,
    neighbourhood: row.neighbourhood ?? "",
    lga:           row.lga ?? "",
    state:         row.state ?? "",
    price:         priceFormatted,
    period:        row.period ?? "",
    beds:          row.beds ?? 0,
    baths:         row.baths ?? 0,
    toilets:       row.toilets ?? 0,
    agent:         agent?.name ?? "Agent",
    agentInitials: agent?.initials ?? "AG",
    agentSlug:     agent?.slug ?? "",
    verified:      agent?.verified ?? false,
    description:   row.description   ?? undefined,
    valuationLow:  row.valuation_low  ?? undefined,
    valuationHigh: row.valuation_high ?? undefined,
    valuationNote: row.valuation_note ?? undefined,
    photos: row.listing_photos
      ? row.listing_photos
          .sort((a, b) => a.position - b.position)
          .map((p) => p.url)
      : undefined,
  };
}

// ─── Canonical URL slug helper ────────────────────────────────────────────────

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Search & filter ──────────────────────────────────────────────────────────

export interface ListingFilter {
  beds?: number;
  minPrice?: number;
  maxPrice?: number;
  verified?: boolean;
  sort?: "newest" | "price_asc" | "price_desc";
}

export function parseFilter(
  sp: Record<string, string | string[] | undefined>,
): ListingFilter {
  const str = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : undefined;
  };
  return {
    beds:     str("beds")     ? Number(str("beds"))     : undefined,
    minPrice: str("min")      ? Number(str("min"))       : undefined,
    maxPrice: str("max")      ? Number(str("max"))       : undefined,
    verified: str("verified") === "1" ? true : undefined,
    sort:     (str("sort") as ListingFilter["sort"]) || undefined,
  };
}

export function applyFilters(listings: Listing[], f: ListingFilter): Listing[] {
  let out = listings.filter((l) => {
    if (f.beds && l.beds < f.beds) return false;
    if (f.minPrice && rawPrice(l) < f.minPrice) return false;
    if (f.maxPrice && rawPrice(l) > f.maxPrice) return false;
    if (f.verified && !l.verified) return false;
    return true;
  });
  if (f.sort === "price_asc")  out = [...out].sort((a, b) => rawPrice(a) - rawPrice(b));
  if (f.sort === "price_desc") out = [...out].sort((a, b) => rawPrice(b) - rawPrice(a));
  return out;
}

function rawPrice(l: Listing): number {
  return Number(l.price.replace(/[^\d]/g, ""));
}

export function detailFor(id: number) {
  return (
    LISTING_DETAIL[id] ?? {
      description:
        "A well-presented property in a sought-after location. Contact the verified agent directly for a full specification sheet, inspection access, and pricing details.",
      attrs: [
        { k: "Completion status", v: "Completed" },
        { k: "Furnishing",        v: "Unfurnished" },
      ],
      agentMeta: "Verified agent",
      agentYears: 3,
      agentRating: 4.7,
      agentReviews: 12,
      agentPhone: "08012345678",
      valuationLow: "—",
      valuationHigh: "—",
      valuationNote: "Not enough comparable sales data yet for this area.",
    }
  );
}
