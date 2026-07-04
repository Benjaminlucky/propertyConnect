/**
 * The 8-category taxonomy and the per-category field definitions that make the
 * listing form adapt. Common fields (price, location, photos) live on the
 * `listings` row; the category-specific `fields` below map to the EAV
 * `listing_attributes` table (listing_id, key, value) — so adding a field to a
 * category never requires an ALTER TABLE.
 */

export type CategoryId =
  | "for-sale"
  | "for-rent"
  | "short-let"
  | "office"
  | "retail"
  | "warehouse"
  | "land"
  | "event-venue";

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "multiselect"
  | "boolean"
  | "date";

export interface FieldDef {
  key: string; // EAV key, e.g. "title_type"
  label: string; // human label
  type: FieldType;
  required?: boolean;
  options?: string[]; // for select / multiselect
  unit?: string; // e.g. "sqm", "hrs/day"
  help?: string;
}

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  pricePeriods: string[]; // first is the default
  subTypes: string[];
  // Whether the common bed/bath/toilet block is relevant
  showRooms: boolean;
  fields: FieldDef[]; // category-specific → listing_attributes
}

export const CATEGORIES: Record<CategoryId, Category> = {
  "for-sale": {
    id: "for-sale",
    label: "Residential — For Sale",
    icon: "🏠",
    pricePeriods: ["total"],
    subTypes: [
      "Flat / Apartment",
      "Detached house",
      "Semi-detached",
      "Terraced duplex",
      "Maisonette",
      "Penthouse",
      "Villa",
    ],
    showRooms: true,
    fields: [
      {
        key: "title_type",
        label: "Title document",
        type: "select",
        required: true,
        options: [
          "C of O",
          "Governor's Consent",
          "R of O",
          "Deed of Assignment",
          "Excision",
          "Gazette",
        ],
      },
      { key: "estate_name", label: "Estate name", type: "text" },
      {
        key: "completion_status",
        label: "Completion status",
        type: "select",
        options: ["Completed", "Under construction", "Off-plan"],
      },
      {
        key: "offplan_pct",
        label: "Off-plan completion",
        type: "number",
        unit: "%",
        help: "Only if off-plan",
      },
    ],
  },
  "for-rent": {
    id: "for-rent",
    label: "Residential — For Rent",
    icon: "🔑",
    pricePeriods: ["per year", "per month"],
    subTypes: [
      "Flat / Apartment",
      "Self-contain",
      "Room only",
      "Mini-flat",
      "Detached house",
      "Duplex",
      "Shared house",
    ],
    showRooms: true,
    fields: [
      { key: "agency_fee_pct", label: "Agency fee", type: "number", unit: "%" },
      { key: "caution_deposit", label: "Caution deposit", type: "number" },
      { key: "service_charge", label: "Service charge", type: "number" },
      {
        key: "lease_term",
        label: "Lease term",
        type: "select",
        options: ["1 year", "2 years", "Monthly"],
      },
      { key: "available_date", label: "Available from", type: "date" },
    ],
  },
  "short-let": {
    id: "short-let",
    label: "Short-let / Vacation",
    icon: "🌙",
    pricePeriods: ["per night", "per week", "per month"],
    subTypes: [
      "Studio",
      "1-bed apartment",
      "2-bed apartment",
      "3+ bed apartment",
      "Villa",
      "Guesthouse",
      "Entire floor",
    ],
    showRooms: true,
    fields: [
      {
        key: "min_stay",
        label: "Minimum stay",
        type: "number",
        unit: "nights",
      },
      {
        key: "amenities",
        label: "Amenities",
        type: "multiselect",
        options: [
          "WiFi",
          "24hr power",
          "Air conditioning",
          "Kitchen",
          "Pool",
          "Gym",
          "Parking",
          "Netflix",
          "Workspace",
          "Washing machine",
        ],
      },
      { key: "checkin_time", label: "Check-in time", type: "text" },
      { key: "checkout_time", label: "Check-out time", type: "text" },
      { key: "house_rules", label: "House rules", type: "text" },
    ],
  },
  office: {
    id: "office",
    label: "Commercial — Office Space",
    icon: "🏢",
    pricePeriods: ["per year", "per month"],
    subTypes: [
      "Open plan",
      "Partitioned",
      "Floor plate",
      "Serviced office",
      "Co-working desk",
    ],
    showRooms: false,
    fields: [
      {
        key: "floor_area_sqm",
        label: "Floor area",
        type: "number",
        unit: "sqm",
        required: true,
      },
      { key: "floor_number", label: "Floor number", type: "text" },
      {
        key: "fitout_status",
        label: "Fit-out status",
        type: "select",
        options: ["Bare shell", "Fitted", "Furnished"],
      },
      {
        key: "power_hours",
        label: "Power supply",
        type: "number",
        unit: "hrs/day",
      },
      { key: "parking_bays", label: "Parking bays", type: "number" },
    ],
  },
  retail: {
    id: "retail",
    label: "Retail — Shops & Showrooms",
    icon: "🛍️",
    pricePeriods: ["per year", "per month"],
    subTypes: [
      "Shopping mall unit",
      "Standalone shop",
      "Open market stall",
      "Showroom",
    ],
    showRooms: false,
    fields: [
      {
        key: "frontage_m",
        label: "Shop frontage width",
        type: "number",
        unit: "m",
      },
      {
        key: "foot_traffic",
        label: "Foot traffic level",
        type: "select",
        options: ["High", "Medium", "Low"],
      },
      { key: "loading_bay", label: "Loading bay", type: "boolean" },
      { key: "trading_hours", label: "Trading hours allowed", type: "text" },
    ],
  },
  warehouse: {
    id: "warehouse",
    label: "Warehouses & Industrial",
    icon: "📦",
    pricePeriods: ["per year", "per month"],
    subTypes: [
      "Storage warehouse",
      "Logistics hub",
      "Factory / production",
      "Cold storage",
    ],
    showRooms: false,
    fields: [
      {
        key: "ceiling_height_m",
        label: "Floor-to-ceiling height",
        type: "number",
        unit: "m",
      },
      { key: "dock_doors", label: "Dock doors", type: "number" },
      {
        key: "floor_load",
        label: "Floor load capacity",
        type: "number",
        unit: "tons/sqm",
      },
      {
        key: "security_grade",
        label: "Security grade",
        type: "select",
        options: ["Basic", "Standard", "High", "Bonded"],
      },
    ],
  },
  land: {
    id: "land",
    label: "Land",
    icon: "📐",
    pricePeriods: ["total"],
    subTypes: [
      "Residential plot",
      "Commercial plot",
      "Agricultural",
      "Industrial",
      "Mixed-use",
    ],
    showRooms: false,
    fields: [
      {
        key: "plot_size",
        label: "Plot size",
        type: "number",
        unit: "sqm",
        required: true,
      },
      {
        key: "title_type",
        label: "Title document",
        type: "select",
        required: true,
        options: [
          "C of O",
          "Governor's Consent",
          "Excision",
          "Gazette",
          "Deed of Assignment",
          "Survey only",
        ],
      },
      { key: "survey_plan", label: "Survey plan available", type: "boolean" },
      {
        key: "flood_status",
        label: "Flood plain status",
        type: "select",
        options: ["Dry land", "Sand-filled", "Waterlogged"],
      },
      {
        key: "road_access",
        label: "Road access",
        type: "select",
        options: ["Tarred", "Graded", "Untarred"],
      },
    ],
  },
  "event-venue": {
    id: "event-venue",
    label: "Event Venues",
    icon: "🎉",
    pricePeriods: ["per day", "per hour"],
    subTypes: [
      "Hall / ballroom",
      "Outdoor space",
      "Hotel conference room",
      "Rooftop",
      "Marquee",
    ],
    showRooms: false,
    fields: [
      {
        key: "seated_capacity",
        label: "Seated capacity",
        type: "number",
        required: true,
      },
      { key: "standing_capacity", label: "Standing capacity", type: "number" },
      {
        key: "catering",
        label: "Catering",
        type: "select",
        options: ["Allowed", "Not allowed", "In-house only"],
      },
      { key: "av_equipment", label: "AV equipment", type: "boolean" },
      { key: "parking_count", label: "Parking spaces", type: "number" },
    ],
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
