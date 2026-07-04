export type VerificationTier = "starter" | "bronze" | "silver" | "gold";

export interface Agent {
  slug: string;
  name: string;
  initials: string;
  bio: string;
  specialisation: string[];
  cities: string[];
  phone: string;
  email: string;
  yearsActive: number;
  rating: number;
  reviewCount: number;
  verificationTier: VerificationTier;
  verified: boolean;
  joinedYear: number;
}

export const AGENTS: Agent[] = [
  {
    slug: "chidi-okonkwo",
    name: "Chidi Okonkwo",
    initials: "CO",
    bio: "Premium agent with 6 years in Lagos and Abuja high-value residential markets. Specialises in Lekki, Ikoyi, Victoria Island, and Maitama. Consistent top performer with 37 five-star reviews. Every listing personally inspected.",
    specialisation: ["Luxury residential", "Investment properties", "Off-plan"],
    cities: ["Lagos", "FCT - Abuja"],
    phone: "08034567890",
    email: "chidi@propconnect.ng",
    yearsActive: 6,
    rating: 4.9,
    reviewCount: 37,
    verificationTier: "gold",
    verified: true,
    joinedYear: 2021,
  },
  {
    slug: "amaka-eze",
    name: "Amaka Eze",
    initials: "AE",
    bio: "Abuja specialist with deep expertise in Gwarinpa, Maitama, Jabi, and Wuse 2. Known for fast turnarounds and transparent agency fees. Handles both residential and commercial mandates.",
    specialisation: ["Abuja residential", "Commercial leases", "Rentals"],
    cities: ["FCT - Abuja"],
    phone: "08056781234",
    email: "amaka@propconnect.ng",
    yearsActive: 5,
    rating: 4.8,
    reviewCount: 29,
    verificationTier: "silver",
    verified: true,
    joinedYear: 2022,
  },
  {
    slug: "tunde-bello",
    name: "Tunde Bello",
    initials: "TB",
    bio: "Port Harcourt's most connected residential and industrial agent. Expert in GRA, Rumuola, and Trans Amadi oil-sector leases. 8 years serving the energy industry's housing needs in Rivers State.",
    specialisation: ["Port Harcourt residential", "Industrial leases", "Oil-sector housing"],
    cities: ["Rivers"],
    phone: "08067891234",
    email: "tunde@propconnect.ng",
    yearsActive: 8,
    rating: 4.7,
    reviewCount: 22,
    verificationTier: "silver",
    verified: true,
    joinedYear: 2019,
  },
  {
    slug: "ngozi-adaobi",
    name: "Ngozi Adaobi",
    initials: "NA",
    bio: "Ibadan-based agent covering Bodija, Ring Road, and Agodi GRA. Trusted advisor to University of Ibadan faculty, UCH professionals, and returning diaspora. Honest, no-pressure service.",
    specialisation: ["Ibadan residential", "University area rentals", "Land acquisition"],
    cities: ["Oyo"],
    phone: "08012345678",
    email: "ngozi@propconnect.ng",
    yearsActive: 4,
    rating: 4.6,
    reviewCount: 14,
    verificationTier: "bronze",
    verified: false,
    joinedYear: 2023,
  },
  {
    slug: "lagos-stays",
    name: "Lagos Stays",
    initials: "LS",
    bio: "Lagos's leading short-let operator with 18 fully managed serviced apartments across Victoria Island, Lekki, Ikate, and Yaba. Corporate-grade cleaning, seamless check-in, 24/7 support.",
    specialisation: ["Short-let management", "Corporate housing", "Event venue hire"],
    cities: ["Lagos"],
    phone: "08098765432",
    email: "bookings@lagosstays.com",
    yearsActive: 4,
    rating: 4.8,
    reviewCount: 61,
    verificationTier: "gold",
    verified: true,
    joinedYear: 2022,
  },
  {
    slug: "kemi-adeleke",
    name: "Kemi Adeleke",
    initials: "KA",
    bio: "Lagos Island specialist with a sharp eye for value in Lekki Phase 1, Ikate, and Ajah. Helps first-time buyers navigate the entire purchase process — title search to key handover. 5 years, 80+ closed deals.",
    specialisation: ["First-time buyer advisory", "Lekki corridor", "Short-let conversions"],
    cities: ["Lagos"],
    phone: "08011223344",
    email: "kemi@propconnect.ng",
    yearsActive: 5,
    rating: 4.8,
    reviewCount: 33,
    verificationTier: "gold",
    verified: true,
    joinedYear: 2021,
  },
  {
    slug: "emeka-obi",
    name: "Emeka Obi",
    initials: "EO",
    bio: "Commercial real estate specialist covering office, retail, and warehouse across Lagos. Clients include SMEs, multinationals, and logistics companies. Experienced in lease structuring and fit-out management.",
    specialisation: ["Commercial leases", "Office space", "Warehouses & logistics"],
    cities: ["Lagos"],
    phone: "08033445566",
    email: "emeka@propconnect.ng",
    yearsActive: 7,
    rating: 4.7,
    reviewCount: 19,
    verificationTier: "silver",
    verified: true,
    joinedYear: 2020,
  },
  {
    slug: "bola-adesanya",
    name: "Bola Adesanya",
    initials: "BA",
    bio: "Lagos Mainland expert — Yaba, Gbagada, Surulere, and Ajah. Widely respected for fair agency fees and no-hassle process. Especially strong on affordable rentals under ₦3m/year and land sales.",
    specialisation: ["Affordable rentals", "Lagos Mainland", "Land & plots"],
    cities: ["Lagos"],
    phone: "08055667788",
    email: "bola@propconnect.ng",
    yearsActive: 6,
    rating: 4.6,
    reviewCount: 41,
    verificationTier: "bronze",
    verified: true,
    joinedYear: 2021,
  },
  {
    slug: "fatima-musa",
    name: "Fatima Musa",
    initials: "FM",
    bio: "Abuja-born agent with unrivalled connections in Maitama, Asokoro, and Wuse 2. Handles ultra-premium residential sales and government-adjacent leases. Bilingual in English and Hausa.",
    specialisation: ["Ultra-premium Abuja", "Diplomatic/government leases", "Off-plan"],
    cities: ["FCT - Abuja"],
    phone: "08077889900",
    email: "fatima@propconnect.ng",
    yearsActive: 7,
    rating: 4.9,
    reviewCount: 28,
    verificationTier: "gold",
    verified: true,
    joinedYear: 2020,
  },
  {
    slug: "gbenga-fashola",
    name: "Gbenga Fashola",
    initials: "GF",
    bio: "Premium Lagos agent covering GRA Ikeja, Magodo Phase 2, and Lekki-Ikoyi corridor. 9 years in the market with a book of repeat corporate and high-net-worth clients. REAN licensed.",
    specialisation: ["GRA Ikeja", "Magodo", "Corporate relocations"],
    cities: ["Lagos"],
    phone: "08099001122",
    email: "gbenga@propconnect.ng",
    yearsActive: 9,
    rating: 4.8,
    reviewCount: 52,
    verificationTier: "gold",
    verified: true,
    joinedYear: 2018,
  },
];

const BY_SLUG = new Map(AGENTS.map((a) => [a.slug, a]));

export function getAgent(slug: string): Agent | undefined {
  return BY_SLUG.get(slug);
}

export function agentSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
