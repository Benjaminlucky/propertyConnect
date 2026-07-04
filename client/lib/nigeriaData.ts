export const NG_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const;

export type NgState = (typeof NG_STATES)[number];

export const LGA_MAP: Partial<Record<NgState, string[]>> = {
  "Lagos": [
    "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa",
    "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye",
    "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland",
    "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere",
  ],
  "FCT - Abuja": [
    "AMAC (Municipal)", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Abaji",
  ],
  "Rivers": [
    "Port Harcourt", "Obio-Akpor", "Okrika", "Ogu-Bolo", "Eleme",
    "Tai", "Gokana", "Khana", "Oyigbo", "Opobo-Nkoro", "Andoni",
    "Bonny", "Degema", "Asari-Toru", "Akuku-Toru", "Abua-Odual",
    "Ahoada West", "Ahoada East", "Ogba-Egbema-Ndoni", "Emohua",
    "Ikwerre", "Etche", "Omuma",
  ],
  "Oyo": [
    "Ibadan North", "Ibadan North East", "Ibadan North West",
    "Ibadan South East", "Ibadan South West", "Akinyele", "Egbeda",
    "Lagelu", "Ona-Ara", "Oluyole", "Ido",
  ],
  "Kano": [
    "Kano Municipal", "Fagge", "Dala", "Gwale", "Tarauni",
    "Nassarawa", "Ungogo", "Kumbotso", "Dawakin Kudu", "Wudil",
  ],
  "Anambra": [
    "Awka North", "Awka South", "Anambra East", "Anambra West",
    "Nnewi North", "Nnewi South", "Onitsha North", "Onitsha South",
    "Ogbaru", "Ekwusigo", "Ihiala", "Idemili North", "Idemili South",
  ],
  "Ogun": [
    "Abeokuta North", "Abeokuta South", "Ifo", "Obafemi-Owode",
    "Sagamu", "Ijebu North", "Ijebu East", "Ijebu Ode", "Odogbolu",
    "Ewekoro", "Ikenne",
  ],
};

export function getLgas(state: string): string[] {
  return LGA_MAP[state as NgState] ?? [];
}

export const PRICE_RANGES: Record<string, Record<string, { min: number; max: number; label: string }>> = {
  "for-sale": {
    "Lagos / Eti-Osa":        { min: 80_000_000,  max: 800_000_000, label: "Lekki / VI corridor" },
    "Lagos / Ikeja":          { min: 40_000_000,  max: 200_000_000, label: "GRA Ikeja corridor" },
    "FCT - Abuja / AMAC":    { min: 50_000_000,  max: 500_000_000, label: "Maitama / Asokoro" },
    "Rivers / Port Harcourt": { min: 20_000_000,  max: 120_000_000, label: "GRA / Old GRA" },
  },
  "for-rent": {
    "Lagos / Eti-Osa":        { min: 2_500_000, max: 25_000_000, label: "per year, Lekki corridor" },
    "Lagos / Ikeja":          { min: 800_000,   max: 6_000_000,  label: "per year, GRA & environs" },
    "FCT - Abuja / AMAC":    { min: 1_200_000, max: 15_000_000, label: "per year, central Abuja" },
  },
};
