/**
 * Static neighbourhood metadata for programmatic SEO landing pages.
 * Each entry becomes the content layer for URLs like:
 *   /ng/for-sale/lagos/eti-osa/lekki-phase-1
 *   /ng/for-rent/fct-abuja/amac/maitama
 *
 * "nearby" slugs must resolve to other entries in this file.
 */

export interface Neighbourhood {
  slug: string;          // URL segment, e.g. "lekki-phase-1"
  name: string;          // Display, e.g. "Lekki Phase 1"
  lga: string;           // Display, e.g. "Eti-Osa"
  lgaSlug: string;       // URL segment
  state: string;         // Display, e.g. "Lagos"
  stateSlug: string;     // URL segment
  description: string;   // 2–3 sentences — used in <meta description> + page body
  highlights: { icon: string; label: string; value: string }[];
  nearby: string[];      // slugs of adjacent areas for internal linking
  demandLevel: "high" | "medium" | "low";
  priceAnchor: string;   // rough market anchor for SEO copy, e.g. "₦80m–₦500m"
  pricePeriod: string;   // "purchase" | "per year" | "per night"
}

export const NEIGHBOURHOODS: Neighbourhood[] = [
  // ─── Lagos — Eti-Osa LGA ───────────────────────────────────────────────────
  {
    slug: "lekki-phase-1",
    name: "Lekki Phase 1",
    lga: "Eti-Osa",
    lgaSlug: "eti-osa",
    state: "Lagos",
    stateSlug: "lagos",
    description:
      "Lekki Phase 1 is Lagos's most established and liquid premium residential market, stretching along the Lekki-Epe Expressway from Admiralty Way to the tollgate. Gated estates, serviced apartments, and purpose-built offices sit side by side, making it attractive to corporate tenants, diaspora buyers, and high-net-worth investors alike.",
    highlights: [
      { icon: "🛣️", label: "Access", value: "Lekki-Epe Expressway + Admiralty Way" },
      { icon: "🏫", label: "Schools", value: "Corona, Greenspring, British International" },
      { icon: "🛍️", label: "Retail", value: "Circle Mall, Spar, Domino's, Silverbird" },
      { icon: "💡", label: "Power", value: "Frequent EKEDC supply + most estates on generators" },
    ],
    nearby: ["ikate", "chevron", "victoria-island", "ikoyi", "osapa-london"],
    demandLevel: "high",
    priceAnchor: "₦80m–₦500m",
    pricePeriod: "purchase",
  },
  {
    slug: "ikate",
    name: "Ikate",
    lga: "Eti-Osa",
    lgaSlug: "eti-osa",
    state: "Lagos",
    stateSlug: "lagos",
    description:
      "Ikate is a rapidly densifying neighbourhood between Lekki Phase 1 and Chevron Drive, popular for its newer apartment blocks and competitive pricing relative to its neighbours. Its proximity to major arterials and the Eti-Osa shoreline has made it a top pick for young professionals and mid-market investors.",
    highlights: [
      { icon: "🛣️", label: "Access", value: "Lekki-Epe Expressway, 5 min from tollgate" },
      { icon: "🏥", label: "Healthcare", value: "EKO Hospital, Reddington within 10 min" },
      { icon: "🛍️", label: "Retail", value: "Novare Mall, Landmark Beach Road" },
      { icon: "🏊", label: "Lifestyle", value: "Close to Landmark Beach and entertainment hub" },
    ],
    nearby: ["lekki-phase-1", "chevron", "osapa-london", "victoria-island"],
    demandLevel: "high",
    priceAnchor: "₦45m–₦200m",
    pricePeriod: "purchase",
  },
  {
    slug: "victoria-island",
    name: "Victoria Island",
    lga: "Eti-Osa",
    lgaSlug: "eti-osa",
    state: "Lagos",
    stateSlug: "lagos",
    description:
      "Victoria Island (VI) is Lagos's Central Business District and financial hub, home to the largest concentration of multinational offices, embassies, luxury hotels, and high-end short-let apartments in Nigeria. Rental demand from corporate tenants and diplomatic staff keeps occupancy rates among the highest in the country.",
    highlights: [
      { icon: "🏦", label: "Finance", value: "GTBank, Zenith, Access Bank HQs" },
      { icon: "🏨", label: "Hospitality", value: "Eko Hotel, Radisson, Intercontinental" },
      { icon: "🚢", label: "Transport", value: "Ozumba Mbadiwe, Ahmadu Bello Way" },
      { icon: "🛍️", label: "Dining", value: "Eko Atlantic, Ocean View, Fine & Country hub" },
    ],
    nearby: ["ikoyi", "lekki-phase-1", "ikate"],
    demandLevel: "high",
    priceAnchor: "₦70,000–₦250,000",
    pricePeriod: "per night",
  },
  {
    slug: "ikoyi",
    name: "Ikoyi",
    lga: "Eti-Osa",
    lgaSlug: "eti-osa",
    state: "Lagos",
    stateSlug: "lagos",
    description:
      "Ikoyi is Lagos's most prestigious residential enclave — low-density, heavily treed, and home to the city's wealthiest families, ambassadors, and C-suite executives. Properties here rarely hit the open market; when they do, they command the highest per-square-metre prices in Nigeria.",
    highlights: [
      { icon: "🌳", label: "Character", value: "Low-density, tree-lined avenues" },
      { icon: "🏫", label: "Schools", value: "American International School, ISL" },
      { icon: "⛳", label: "Leisure", value: "Ikoyi Club 1938, Lagos Polo Club" },
      { icon: "🔒", label: "Security", value: "Private security + government perimeter" },
    ],
    nearby: ["victoria-island", "lekki-phase-1"],
    demandLevel: "high",
    priceAnchor: "₦300m–₦2b+",
    pricePeriod: "purchase",
  },
  {
    slug: "chevron",
    name: "Chevron",
    lga: "Eti-Osa",
    lgaSlug: "eti-osa",
    state: "Lagos",
    stateSlug: "lagos",
    description:
      "The Chevron corridor stretches from the Chevron roundabout toward Lekki Phase 2 and is anchored by several large gated estates. It offers a mid-point between Lekki Phase 1's premium and Ajah's affordability, attracting families seeking good schools and manageable commute times.",
    highlights: [
      { icon: "🛣️", label: "Access", value: "Lekki-Epe Expressway + Chevron Drive" },
      { icon: "🏫", label: "Schools", value: "Greenspring, International College" },
      { icon: "🏥", label: "Healthcare", value: "Lakeside Hospital, St. Nicholas nearby" },
      { icon: "🛍️", label: "Shopping", value: "Mega Chicken Plaza, Shoprite Sangotedo" },
    ],
    nearby: ["ikate", "osapa-london", "ajah", "lekki-phase-1"],
    demandLevel: "high",
    priceAnchor: "₦50m–₦250m",
    pricePeriod: "purchase",
  },
  {
    slug: "osapa-london",
    name: "Osapa London",
    lga: "Eti-Osa",
    lgaSlug: "eti-osa",
    state: "Lagos",
    stateSlug: "lagos",
    description:
      "Osapa London is a fast-growing residential estate off Chevron Drive, favoured for its newer building stock, relatively stable roads, and proximity to Lekki Phase 1 amenities at a lower entry price. It attracts young professionals and diaspora investors seeking capital appreciation.",
    highlights: [
      { icon: "🛣️", label: "Access", value: "Chevron Drive, 8 min to tollgate" },
      { icon: "🏊", label: "Leisure", value: "Nicon Town waterfront proximity" },
      { icon: "🛍️", label: "Retail", value: "Shoprite Novare, Circle Mall" },
      { icon: "💡", label: "Power", value: "Estate-managed power common" },
    ],
    nearby: ["chevron", "ikate", "ajah", "lekki-phase-1"],
    demandLevel: "medium",
    priceAnchor: "₦30m–₦120m",
    pricePeriod: "purchase",
  },
  {
    slug: "ajah",
    name: "Ajah",
    lga: "Eti-Osa",
    lgaSlug: "eti-osa",
    state: "Lagos",
    stateSlug: "lagos",
    description:
      "Ajah is the fastest-growing residential hub on the Lekki Peninsula, offering the best value for money on the corridor. Large estate developments from Novare to Ogombo Road have transformed it from a fringe area to a sought-after destination for first-time buyers and growing families.",
    highlights: [
      { icon: "🛣️", label: "Access", value: "Lekki-Epe Expressway, 25 min from VI" },
      { icon: "🛍️", label: "Retail", value: "Novare Mall, Shoprite Ajah" },
      { icon: "🏫", label: "Schools", value: "Victory School, Greenfield Academy" },
      { icon: "💰", label: "Value", value: "Best price-per-sqm on the Lekki corridor" },
    ],
    nearby: ["sangotedo", "chevron", "osapa-london"],
    demandLevel: "high",
    priceAnchor: "₦15m–₦80m",
    pricePeriod: "purchase",
  },
  {
    slug: "sangotedo",
    name: "Sangotedo",
    lga: "Eti-Osa",
    lgaSlug: "eti-osa",
    state: "Lagos",
    stateSlug: "lagos",
    description:
      "Sangotedo is the emerging frontier of the Lekki axis — a dense residential corridor near Shoprite Sangotedo where land and apartment prices remain accessible compared to Ajah. Infrastructure investment is accelerating, and many buyers are purchasing now ahead of expected appreciation.",
    highlights: [
      { icon: "🛍️", label: "Anchor", value: "Shoprite Sangotedo + Novare Festival Mall" },
      { icon: "🛣️", label: "Access", value: "Lekki-Epe Expressway" },
      { icon: "💰", label: "Entry", value: "Lowest entry price on Lekki corridor" },
      { icon: "📈", label: "Trend", value: "Rising demand from Ajah overspill" },
    ],
    nearby: ["ajah", "chevron", "osapa-london"],
    demandLevel: "medium",
    priceAnchor: "₦8m–₦45m",
    pricePeriod: "purchase",
  },
  // ─── Lagos — Other LGAs ───────────────────────────────────────────────────
  {
    slug: "gbagada",
    name: "Gbagada",
    lga: "Shomolu",
    lgaSlug: "shomolu",
    state: "Lagos",
    stateSlug: "lagos",
    description:
      "Gbagada is one of Lagos Mainland's most established and desirable residential addresses, favoured for its relatively stable infrastructure, strong security community association, and proximity to Lagos Island. It attracts mid-to-upper income professionals who work on the Island but prefer the quieter Mainland lifestyle.",
    highlights: [
      { icon: "🛣️", label: "Access", value: "3rd Mainland Bridge — 15 min to Lagos Island" },
      { icon: "🏥", label: "Healthcare", value: "Lagos University Teaching Hospital (LUTH)" },
      { icon: "🏫", label: "Schools", value: "Gbagada Senior Secondary, private schools" },
      { icon: "🔒", label: "Security", value: "Active community estate associations" },
    ],
    nearby: ["yaba", "surulere"],
    demandLevel: "medium",
    priceAnchor: "₦8m–₦60m",
    pricePeriod: "purchase",
  },
  {
    slug: "yaba",
    name: "Yaba",
    lga: "Lagos Mainland",
    lgaSlug: "lagos-mainland",
    state: "Lagos",
    stateSlug: "lagos",
    description:
      "Yaba is Lagos's tech and university hub — home to Unilag, YABATECH, the Yaba Technology District, and a growing cluster of co-working spaces and startups. Rental demand from students, young professionals, and short-let operators is consistently strong, keeping vacancy rates low.",
    highlights: [
      { icon: "🎓", label: "Education", value: "University of Lagos, YABATECH" },
      { icon: "💻", label: "Tech", value: "Yaba Technology District (Co-Creation Hub)" },
      { icon: "🚇", label: "Transport", value: "Lagos Rail Mass Transit station (coming)" },
      { icon: "🛍️", label: "Retail", value: "Tejuosho Ultra Modern Market" },
    ],
    nearby: ["gbagada", "surulere"],
    demandLevel: "high",
    priceAnchor: "₦500k–₦2.5m",
    pricePeriod: "per year",
  },
  {
    slug: "surulere",
    name: "Surulere",
    lga: "Surulere",
    lgaSlug: "surulere",
    state: "Lagos",
    stateSlug: "lagos",
    description:
      "Surulere is a mature, densely-populated Lagos Mainland neighbourhood known for affordable residential options and strong transport links. National Stadium proximity and a dense network of streets make it a perennially high-demand rental market for working-class and middle-income tenants.",
    highlights: [
      { icon: "🏟️", label: "Landmark", value: "National Stadium, National Arts Theatre" },
      { icon: "🚌", label: "Transport", value: "Excellent BRT and danfo connections" },
      { icon: "🛍️", label: "Markets", value: "Adeniran Ogunsanya Mall, Tejuosho" },
      { icon: "💰", label: "Value", value: "Consistent rental demand, low vacancy" },
    ],
    nearby: ["yaba", "gbagada"],
    demandLevel: "medium",
    priceAnchor: "₦400k–₦1.8m",
    pricePeriod: "per year",
  },
  {
    slug: "magodo-phase-2",
    name: "Magodo Phase 2",
    lga: "Kosofe",
    lgaSlug: "kosofe",
    state: "Lagos",
    stateSlug: "lagos",
    description:
      "Magodo Phase 2 is one of Lagos's most prestigious planned residential estates — wide roads, low-density housing, and a strong residents' association that enforces standards and security. It attracts senior executives, retirees, and families seeking a calm, well-maintained environment close to Ikeja.",
    highlights: [
      { icon: "🛣️", label: "Roads", value: "Wide, well-maintained estate roads" },
      { icon: "✈️", label: "Access", value: "20 min to Murtala Muhammed Airport" },
      { icon: "🔒", label: "Security", value: "Gated estate, strict access control" },
      { icon: "🏫", label: "Schools", value: "Close to several Ikeja-area private schools" },
    ],
    nearby: ["gra-ikeja"],
    demandLevel: "medium",
    priceAnchor: "₦40m–₦200m",
    pricePeriod: "purchase",
  },
  {
    slug: "gra-ikeja",
    name: "GRA Ikeja",
    lga: "Ikeja",
    lgaSlug: "ikeja",
    state: "Lagos",
    stateSlug: "lagos",
    description:
      "The Government Reserved Area in Ikeja is the institutional and commercial heart of Lagos Mainland — home to the Lagos State Government complex, corporate headquarters, and a dense mix of residential and commercial properties. Its airport proximity makes it a top choice for short-let operators catering to business travellers.",
    highlights: [
      { icon: "✈️", label: "Airport", value: "7 min to Murtala Muhammed Airport" },
      { icon: "🏛️", label: "Government", value: "Lagos State Secretariat" },
      { icon: "🏦", label: "Commerce", value: "Allen Avenue commercial spine" },
      { icon: "🏨", label: "Hotels", value: "Best Western, Sheraton, Four Points" },
    ],
    nearby: ["magodo-phase-2"],
    demandLevel: "medium",
    priceAnchor: "₦25m–₦120m",
    pricePeriod: "purchase",
  },
  // ─── FCT — AMAC LGA ───────────────────────────────────────────────────────
  {
    slug: "maitama",
    name: "Maitama",
    lga: "AMAC",
    lgaSlug: "amac",
    state: "FCT - Abuja",
    stateSlug: "fct-abuja",
    description:
      "Maitama is Abuja's most exclusive residential district — home to ambassadors, senior government officials, and Nigeria's wealthiest families. Ultra-low density, embassy row, and a coveted address define the area; supply is permanently constrained by zoning, keeping prices among the highest in the country.",
    highlights: [
      { icon: "🏛️", label: "Status", value: "Embassy row, diplomatic residences" },
      { icon: "🛣️", label: "Access", value: "5 min to Three Arms Zone, Aso Rock vicinity" },
      { icon: "⛳", label: "Leisure", value: "Abuja Golf Club, Maitama Park" },
      { icon: "🛍️", label: "Dining", value: "Transcorp Hilton, Wuse Market nearby" },
    ],
    nearby: ["asokoro", "wuse-2", "utako"],
    demandLevel: "high",
    priceAnchor: "₦150m–₦1b+",
    pricePeriod: "purchase",
  },
  {
    slug: "asokoro",
    name: "Asokoro",
    lga: "AMAC",
    lgaSlug: "amac",
    state: "FCT - Abuja",
    stateSlug: "fct-abuja",
    description:
      "Asokoro is Abuja's seat of power — directly adjacent to Aso Rock Presidential Villa and home to the President's official residence, Supreme Court, and most federal government ministries. It is one of the most secure and exclusive addresses in Nigeria.",
    highlights: [
      { icon: "🏛️", label: "Government", value: "Aso Rock, Supreme Court, FEC Chambers" },
      { icon: "🔒", label: "Security", value: "Highest security perimeter in Nigeria" },
      { icon: "🌳", label: "Environment", value: "Green open spaces, wide boulevards" },
      { icon: "🏨", label: "Hospitality", value: "Nicon Luxury, Sheraton Hotels" },
    ],
    nearby: ["maitama", "wuse-2", "garki"],
    demandLevel: "high",
    priceAnchor: "₦200m–₦1.5b",
    pricePeriod: "purchase",
  },
  {
    slug: "wuse-2",
    name: "Wuse 2",
    lga: "AMAC",
    lgaSlug: "amac",
    state: "FCT - Abuja",
    stateSlug: "fct-abuja",
    description:
      "Wuse 2 is Abuja's premier commercial and upscale residential hub — the heartbeat of the city's retail, banking, and nightlife economy. Banex Plaza, Aminu Kano Crescent, and Ademola Adetokunbo Street define a dense urban environment that commands Abuja's highest commercial rents.",
    highlights: [
      { icon: "🏦", label: "Banking", value: "Highest bank branch density in Abuja" },
      { icon: "🛍️", label: "Retail", value: "Banex Plaza, Ceddi Plaza" },
      { icon: "🚗", label: "Access", value: "Central location, short drive to any district" },
      { icon: "🍽️", label: "Dining", value: "Best restaurant density in Abuja" },
    ],
    nearby: ["maitama", "jabi", "utako", "garki"],
    demandLevel: "high",
    priceAnchor: "₦80m–₦350m",
    pricePeriod: "purchase",
  },
  {
    slug: "jabi",
    name: "Jabi",
    lga: "AMAC",
    lgaSlug: "amac",
    state: "FCT - Abuja",
    stateSlug: "fct-abuja",
    description:
      "Jabi is Abuja's most vibrant mixed-use district, anchored by the Jabi Lake Mall and a growing hospitality corridor. Its lakefront setting, proximity to Maitama and Wuse 2, and expanding short-let market make it one of the fastest-appreciating areas in the capital.",
    highlights: [
      { icon: "🛍️", label: "Anchor", value: "Jabi Lake Mall — Abuja's best mall" },
      { icon: "🏊", label: "Leisure", value: "Jabi Lake waterfront, Jabi Boat Club" },
      { icon: "🏨", label: "Short-let", value: "High short-let demand, corporate travelers" },
      { icon: "🛣️", label: "Access", value: "Airport Road + Herbert Macaulay Way" },
    ],
    nearby: ["wuse-2", "maitama", "utako", "life-camp"],
    demandLevel: "high",
    priceAnchor: "₦60,000–₦200,000",
    pricePeriod: "per night",
  },
  {
    slug: "gwarinpa",
    name: "Gwarinpa",
    lga: "AMAC",
    lgaSlug: "amac",
    state: "FCT - Abuja",
    stateSlug: "fct-abuja",
    description:
      "Gwarinpa is Abuja's largest residential district and the city's primary middle-income housing market. Wide planned streets, a dense concentration of duplexes and apartment blocks, and competitive pricing make it the first stop for families relocating to Abuja from other states.",
    highlights: [
      { icon: "🏘️", label: "Scale", value: "Largest residential district in Abuja" },
      { icon: "🏫", label: "Schools", value: "Best school density in Abuja districts" },
      { icon: "🛍️", label: "Retail", value: "Gwarinpa Mall, market clusters" },
      { icon: "💰", label: "Value", value: "Best price-per-sqm in central Abuja" },
    ],
    nearby: ["life-camp", "jabi", "utako"],
    demandLevel: "high",
    priceAnchor: "₦30m–₦150m",
    pricePeriod: "purchase",
  },
  {
    slug: "life-camp",
    name: "Life Camp",
    lga: "AMAC",
    lgaSlug: "amac",
    state: "FCT - Abuja",
    stateSlug: "fct-abuja",
    description:
      "Life Camp is a planned residential district along the Airport Road corridor, emerging as one of Abuja's fastest-growing middle-income neighbourhoods. Its proximity to Gwarinpa and Jabi, improving infrastructure, and lower entry prices attract families and investors seeking appreciation upside.",
    highlights: [
      { icon: "🛣️", label: "Access", value: "Airport Road + Gwarinpa corridor" },
      { icon: "🏗️", label: "Growth", value: "Fastest-growing district in Abuja" },
      { icon: "💡", label: "Power", value: "Abuja Distribution Company stable supply" },
      { icon: "💰", label: "Entry", value: "Lower entry price, strong appreciation trend" },
    ],
    nearby: ["gwarinpa", "jabi", "utako"],
    demandLevel: "medium",
    priceAnchor: "₦20m–₦90m",
    pricePeriod: "purchase",
  },
  {
    slug: "utako",
    name: "Utako",
    lga: "AMAC",
    lgaSlug: "amac",
    state: "FCT - Abuja",
    stateSlug: "fct-abuja",
    description:
      "Utako is a centrally-located Abuja district straddling the residential and commercial zones — well-connected to Wuse 2, Jabi, and Maitama, with a growing mixed-use character. It appeals to young professionals who want proximity to Abuja's business core without Maitama's premium pricing.",
    highlights: [
      { icon: "🛣️", label: "Location", value: "Central — equidistant from all major districts" },
      { icon: "🏦", label: "Commerce", value: "Growing office and co-working cluster" },
      { icon: "🍽️", label: "Dining", value: "Dense restaurant and café strip" },
      { icon: "🏥", label: "Healthcare", value: "Garki Hospital nearby" },
    ],
    nearby: ["jabi", "wuse-2", "maitama", "gwarinpa"],
    demandLevel: "medium",
    priceAnchor: "₦50m–₦200m",
    pricePeriod: "purchase",
  },
  {
    slug: "garki",
    name: "Garki",
    lga: "AMAC",
    lgaSlug: "amac",
    state: "FCT - Abuja",
    stateSlug: "fct-abuja",
    description:
      "Garki is Abuja's original administrative district — government ministries, the old Federal Secretariat, and diplomatic missions have anchored it since the city's founding. It is a mature market with stable rental demand from civil servants and NGO staff.",
    highlights: [
      { icon: "🏛️", label: "Government", value: "Federal Secretariat, MDAs headquarters" },
      { icon: "🌐", label: "NGOs", value: "UN agencies, bilateral missions" },
      { icon: "🛍️", label: "Market", value: "Wuse Market — largest in Abuja" },
      { icon: "🏥", label: "Healthcare", value: "Garki General Hospital" },
    ],
    nearby: ["asokoro", "wuse-2", "utako"],
    demandLevel: "medium",
    priceAnchor: "₦40m–₦180m",
    pricePeriod: "purchase",
  },
  // ─── Rivers — Port Harcourt LGA ──────────────────────────────────────────
  {
    slug: "gra",
    name: "GRA",
    lga: "Port Harcourt",
    lgaSlug: "port-harcourt",
    state: "Rivers",
    stateSlug: "rivers",
    description:
      "The Government Reserved Area in Port Harcourt is the city's most prestigious residential address — wide tree-lined streets, large compounds, and a history as the base for oil company executives and diplomats. Rental demand from oil & gas multinationals keeps occupancy at near-full capacity year-round.",
    highlights: [
      { icon: "🛢️", label: "Anchor Tenants", value: "Shell, Chevron, Total staff housing" },
      { icon: "🌳", label: "Character", value: "Low-density, large compounds, old trees" },
      { icon: "🏨", label: "Hotels", value: "Protea, Novotel, Presidential Hotel" },
      { icon: "🔒", label: "Security", value: "Well-patrolled, strong community" },
    ],
    nearby: ["rumuola", "trans-amadi", "woji"],
    demandLevel: "high",
    priceAnchor: "₦6m–₦25m",
    pricePeriod: "per year",
  },
  {
    slug: "rumuola",
    name: "Rumuola",
    lga: "Port Harcourt",
    lgaSlug: "port-harcourt",
    state: "Rivers",
    stateSlug: "rivers",
    description:
      "Rumuola is a well-established middle-income residential area in Port Harcourt offering a strong mix of flats, duplexes, and commercial units. Its proximity to the central business district and University of Port Harcourt Teaching Hospital drives consistently strong rental demand.",
    highlights: [
      { icon: "🏥", label: "Healthcare", value: "UPTH — major teaching hospital" },
      { icon: "🛣️", label: "Access", value: "Direct route to PH city centre" },
      { icon: "🏫", label: "Schools", value: "Multiple private secondary schools" },
      { icon: "💰", label: "Value", value: "Lower entry than GRA with strong demand" },
    ],
    nearby: ["gra", "trans-amadi", "woji"],
    demandLevel: "medium",
    priceAnchor: "₦15m–₦60m",
    pricePeriod: "purchase",
  },
  {
    slug: "trans-amadi",
    name: "Trans Amadi",
    lga: "Port Harcourt",
    lgaSlug: "port-harcourt",
    state: "Rivers",
    stateSlug: "rivers",
    description:
      "Trans Amadi is Port Harcourt's primary industrial and logistics corridor — home to oil servicing companies, warehouses, and light manufacturing. Commercial and industrial property demand is driven by the oil & gas supply chain, making it the city's most active commercial real estate market.",
    highlights: [
      { icon: "🛢️", label: "Industry", value: "Oil & gas services and supply chain hub" },
      { icon: "🏭", label: "Industrial", value: "Warehouses, fabrication yards, logistics" },
      { icon: "🛣️", label: "Access", value: "Trans Amadi Industrial Road" },
      { icon: "📦", label: "Supply Chain", value: "Close to Port Harcourt Port" },
    ],
    nearby: ["gra", "rumuola", "woji"],
    demandLevel: "medium",
    priceAnchor: "₦3m–₦15m",
    pricePeriod: "per year",
  },
  {
    slug: "woji",
    name: "Woji",
    lga: "Obio-Akpor",
    lgaSlug: "obio-akpor",
    state: "Rivers",
    stateSlug: "rivers",
    description:
      "Woji is one of Port Harcourt's fastest-growing residential areas, offering newer apartment developments at competitive prices with improving road infrastructure. Its mid-point location between the GRA, Trans Amadi, and the Eastern Bypass makes it a popular choice for mobile oil sector workers.",
    highlights: [
      { icon: "🏗️", label: "Development", value: "New apartment blocks, gated estates" },
      { icon: "🛣️", label: "Access", value: "Eastern Bypass + Rumuola Road junction" },
      { icon: "💰", label: "Value", value: "Best new-build value in PH metro" },
      { icon: "📈", label: "Trend", value: "Strong capital appreciation over 5 years" },
    ],
    nearby: ["gra", "rumuola", "trans-amadi"],
    demandLevel: "medium",
    priceAnchor: "₦10m–₦50m",
    pricePeriod: "purchase",
  },
  // ─── Oyo — Ibadan ────────────────────────────────────────────────────────
  {
    slug: "bodija",
    name: "Bodija",
    lga: "Ibadan North",
    lgaSlug: "ibadan-north",
    state: "Oyo",
    stateSlug: "oyo",
    description:
      "Bodija is Ibadan's premier residential neighbourhood — a government-planned estate of wide roads and well-maintained plots that has retained its appeal for the city's academic, political, and business elite. Its proximity to the University of Ibadan and UCH drives strong demand from professionals.",
    highlights: [
      { icon: "🎓", label: "Education", value: "University of Ibadan, UCH" },
      { icon: "🌳", label: "Character", value: "Planned estate, wide roads" },
      { icon: "🏥", label: "Healthcare", value: "UCH — Nigeria's premier teaching hospital" },
      { icon: "🛍️", label: "Retail", value: "Bodija Market, Palms Mall, Challenge" },
    ],
    nearby: ["ring-road", "agodi-gra"],
    demandLevel: "medium",
    priceAnchor: "₦20m–₦80m",
    pricePeriod: "purchase",
  },
  {
    slug: "ring-road",
    name: "Ring Road",
    lga: "Ibadan North",
    lgaSlug: "ibadan-north",
    state: "Oyo",
    stateSlug: "oyo",
    description:
      "Ring Road is Ibadan's central commercial and residential hub — a busy confluence of trade, banking, and residential property. It serves as the city's primary transport artery, connecting all major neighbourhoods, and is a high-demand rental market for professionals working in central Ibadan.",
    highlights: [
      { icon: "🚌", label: "Transport", value: "Central transport hub for all of Ibadan" },
      { icon: "🏦", label: "Banking", value: "Major bank branch concentration" },
      { icon: "🛍️", label: "Commercial", value: "Cocoa House, Leventis, Palms Mall" },
      { icon: "💰", label: "Rental Yield", value: "High yield from central location" },
    ],
    nearby: ["bodija", "agodi-gra"],
    demandLevel: "medium",
    priceAnchor: "₦300k–₦1.5m",
    pricePeriod: "per year",
  },
  {
    slug: "agodi-gra",
    name: "Agodi GRA",
    lga: "Ibadan North",
    lgaSlug: "ibadan-north",
    state: "Oyo",
    stateSlug: "oyo",
    description:
      "Agodi GRA is Ibadan's most exclusive address — a low-density government reserved area of large compounds, mature trees, and wide boulevards. Senior civil servants, business owners, and Ibadan's establishment families have long made it their home, and supply of available properties is extremely limited.",
    highlights: [
      { icon: "🌳", label: "Character", value: "Low-density, mature trees, quiet streets" },
      { icon: "🏛️", label: "Government", value: "Oyo State Government House" },
      { icon: "🔒", label: "Security", value: "Government-secured perimeter" },
      { icon: "🎓", label: "Proximity", value: "5 min to University of Ibadan" },
    ],
    nearby: ["bodija", "ring-road"],
    demandLevel: "low",
    priceAnchor: "₦30m–₦120m",
    pricePeriod: "purchase",
  },
];

/** O(1) lookup by slug */
const BY_SLUG = new Map(NEIGHBOURHOODS.map((n) => [n.slug, n]));
export function getNeighbourhood(slug: string): Neighbourhood | undefined {
  return BY_SLUG.get(slug);
}

/** All neighbourhoods in a given state slug */
export function neighbourhoodsInState(stateSlug: string): Neighbourhood[] {
  return NEIGHBOURHOODS.filter((n) => n.stateSlug === stateSlug);
}

/** All neighbourhoods in a given LGA slug */
export function neighbourhoodsInLga(lgaSlug: string): Neighbourhood[] {
  return NEIGHBOURHOODS.filter((n) => n.lgaSlug === lgaSlug);
}
