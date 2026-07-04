import { api } from "./api";

export type EnquiryType = "whatsapp" | "viewing" | "message";
export type LeadStatus  = "new" | "viewed" | "replied" | "closed";

export interface Lead {
  id: string;
  listingId: number;
  listingTitle: string;
  listingPrice: string;
  listingCategory: string;
  neighbourhood: string;
  state: string;
  agentName: string;
  type: EnquiryType;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  message?: string;
  viewingDate?: string;
  viewingTime?: string;
  createdAt: string;
  status: LeadStatus;
  score: number;
}

// ── Raw DB row returned by GET /api/v1/enquiries ─────────────────────────────
interface DbEnquiryRow {
  id: number;
  listing_id: number;
  mode: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  score: number;
  status: string;
  created_at: string;
  listings?: { title: string; neighbourhood: string } | null;
}

const STATUS_FROM_DB: Record<string, LeadStatus> = {
  new:            "new",
  contacted:      "viewed",
  viewing_booked: "replied",
  closed:         "closed",
};

const STATUS_TO_DB: Record<LeadStatus, string> = {
  new:    "new",
  viewed: "contacted",
  replied:"viewing_booked",
  closed: "closed",
};

export function dbEnquiryToLead(e: DbEnquiryRow): Lead {
  return {
    id:            `db_${e.id}`,
    listingId:     e.listing_id,
    listingTitle:  e.listings?.title ?? "Listing",
    listingPrice:  "",
    listingCategory: "",
    neighbourhood: e.listings?.neighbourhood ?? "",
    state:         "",
    agentName:     "",
    type:          e.mode as EnquiryType,
    senderName:    e.name,
    senderPhone:   e.phone ?? undefined,
    senderEmail:   e.email ?? undefined,
    createdAt:     e.created_at,
    status:        STATUS_FROM_DB[e.status] ?? "new",
    score:         e.score,
    message:       e.message ?? undefined,
  };
}

export async function fetchDbLeads(token: string): Promise<Lead[]> {
  try {
    const rows = await api.get<DbEnquiryRow[]>("/api/v1/enquiries", token);
    return rows.map(dbEnquiryToLead);
  } catch {
    return [];
  }
}

export async function updateDbLeadStatus(
  leadId: string,
  status: LeadStatus,
  token: string,
): Promise<void> {
  const numericId = leadId.replace("db_", "");
  await api.patch(`/api/v1/enquiries/${numericId}/status`, { status: STATUS_TO_DB[status] }, token);
}

// ── localStorage (seed listings + offline fallback) ───────────────────────────
function scoreFor(type: EnquiryType, hasPhone: boolean): number {
  const base = type === "viewing" ? 88 : type === "message" ? 82 : 76;
  return hasPhone ? base : base - 12;
}

const KEY = "pc_leads";

export function getLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Lead[]) : [];
  } catch { return []; }
}

export function saveLead(data: Omit<Lead, "id" | "createdAt" | "status" | "score">): Lead {
  const lead: Lead = {
    ...data,
    id:        `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status:    "new",
    score:     scoreFor(data.type, !!data.senderPhone),
  };
  const current = getLeads();
  localStorage.setItem(KEY, JSON.stringify([lead, ...current]));
  return lead;
}

export function updateLeadStatus(id: string, status: LeadStatus): void {
  const leads = getLeads().map(l => l.id === id ? { ...l, status } : l);
  localStorage.setItem(KEY, JSON.stringify(leads));
}
