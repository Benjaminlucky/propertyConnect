"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Home, KeyRound, Moon, Building2, ShoppingBag, Package, Layers, PartyPopper,
  ChevronRight, ChevronLeft, ImagePlus, Info, ShieldCheck, Check, X,
  TrendingUp, Lightbulb, MapPin, Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { LogoMark } from "@/components/ui/Icons";
import { AuthUser } from "@/lib/auth";
import { NG_STATES, getLgas } from "@/lib/nigeriaData";
import { revalidateAfterPublish } from "@/lib/actions";

/* ── Categories ─────────────────────────────────────────────────── */

interface Category {
  key: string;
  Icon: LucideIcon;
  title: string;
  blurb: string;
  pricePeriods: string[];
  priceLabel: string;
}

const CATEGORIES: Category[] = [
  { key: "for-sale",    Icon: Home,        title: "For Sale",      blurb: "Flat, duplex, detached, off-plan",       pricePeriods: ["Outright"],              priceLabel: "Asking price"    },
  { key: "for-rent",    Icon: KeyRound,    title: "For Rent",      blurb: "Apartment, self-contain, shared house",  pricePeriods: ["Per year","Per month"],  priceLabel: "Annual rent"     },
  { key: "short-let",   Icon: Moon,        title: "Short-let",     blurb: "Nightly, weekly or monthly stays",       pricePeriods: ["Per night","Per week"],  priceLabel: "Nightly rate"    },
  { key: "office",      Icon: Building2,   title: "Office Space",  blurb: "Serviced, open-plan, co-working",        pricePeriods: ["Per year","Per month"],  priceLabel: "Annual lease"    },
  { key: "retail",      Icon: ShoppingBag, title: "Retail & Shop", blurb: "Mall unit, showroom, stall",             pricePeriods: ["Per year","Per month"],  priceLabel: "Annual rent"     },
  { key: "warehouse",   Icon: Package,     title: "Warehouse",     blurb: "Storage, logistics, cold storage",       pricePeriods: ["Per year","Per month"],  priceLabel: "Annual lease"    },
  { key: "land",        Icon: Layers,      title: "Land",          blurb: "Plot with C of O, survey or gazette",   pricePeriods: ["Outright"],              priceLabel: "Asking price"    },
  { key: "event-venue", Icon: PartyPopper, title: "Event Venue",   blurb: "Hall, rooftop, outdoor event space",     pricePeriods: ["Per event","Per day"],   priceLabel: "Venue hire rate" },
];

const BUILDING_TYPES  = ["Flat / Apartment","Duplex","Detached House","Semi-detached","Terrace","Bungalow","Penthouse","Block of Flats"];
const FURNISHING_OPTS = ["Unfurnished","Semi-furnished","Fully furnished"];
const LAND_TITLES     = ["C of O","Governor's Consent","Deed of Assignment","Survey Plan","Gazette","Leasehold"];
const LAND_FEATURES   = ["Fenced","Gated","Electricity","Water","Road access","Drainage"];
const COMM_CONDITIONS = ["Shell & core","Fitted out","Fully furnished"];
const VENUE_SETUPS    = ["Banquet","Theatre","Boardroom","Cocktail","Outdoor","Lecture"];
const VENUE_AMENITIES = ["Air conditioning","Generator","Kitchen","Parking","PA system","Stage","Catering","Event staff"];
const PROP_FEATURES   = [
  "Gated estate","24hr power","Borehole","Gym","Swimming pool","BQ / Boys quarters",
  "Smart home","Waterfront","Ocean view","CCTV","Security","Elevator",
  "Rooftop terrace","Garden","Solar power","Fibre internet","Pet friendly","Parking",
];

const STEPS = [
  { num: 1, label: "Category"    },
  { num: 2, label: "Location"    },
  { num: 3, label: "Details"     },
  { num: 4, label: "Pricing"     },
  { num: 5, label: "Photos"      },
  { num: 6, label: "Description" },
  { num: 7, label: "Review"      },
];

/* ── Draft state ────────────────────────────────────────────────── */

interface Draft {
  category: string; state: string; lga: string; neighbourhood: string;
  address: string;  landmark: string;
  beds: string; baths: string; toilets: string; buildingType: string;
  furnishing: string; sqm: string; parking: string; floor: string;
  plotSize: string; plotUnit: string; titleType: string; landFeatures: string[];
  floorArea: string; floorLevel: string; condition: string;
  capacity: string; venueType: string; setupStyles: string[]; venueAmenities: string[];
  price: string; period: string; negotiable: boolean; serviceCharge: string;
  photos: string[]; title: string; description: string; features: string[];
}

const BLANK: Draft = {
  category: "", state: "", lga: "", neighbourhood: "", address: "", landmark: "",
  beds: "", baths: "", toilets: "", buildingType: "", furnishing: "", sqm: "", parking: "", floor: "",
  plotSize: "", plotUnit: "sqm", titleType: "", landFeatures: [],
  floorArea: "", floorLevel: "", condition: "",
  capacity: "", venueType: "Indoor", setupStyles: [], venueAmenities: [],
  price: "", period: "Per year", negotiable: false, serviceCharge: "",
  photos: [], title: "", description: "", features: [],
};

/* ── Helpers ─────────────────────────────────────────────────────── */

const isResidential = (c: string) => ["for-sale","for-rent","short-let"].includes(c);
const isLand        = (c: string) => c === "land";
const isCommercial  = (c: string) => ["office","retail","warehouse"].includes(c);
const isVenue       = (c: string) => c === "event-venue";

function computeScore(d: Draft): number {
  let s = 0;
  if (d.category)                                             s += 0.5;
  if (d.state)                                               s += 0.5;
  if (d.lga)                                                 s += 0.5;
  if (d.neighbourhood)                                       s += 0.5;
  if (d.address)                                             s += 0.5;
  if (d.price && Number(d.price.replace(/,/g,"")) > 0)      s += 1;
  if (isResidential(d.category)) {
    if (d.beds)          s += 0.5;
    if (d.baths)         s += 0.5;
    if (d.buildingType)  s += 0.25;
    if (d.furnishing)    s += 0.25;
    if (d.sqm)           s += 0.5;
  }
  if (isLand(d.category)) {
    if (d.plotSize)   s += 0.5;
    if (d.titleType)  s += 1;
  }
  if (isCommercial(d.category)) {
    if (d.floorArea)  s += 0.5;
    if (d.condition)  s += 0.5;
  }
  if (d.photos.length >= 1)   s += 1;
  if (d.photos.length >= 5)   s += 1;
  if (d.photos.length >= 10)  s += 0.5;
  if (d.title.length > 10)    s += 1;
  if (d.description.length > 100) s += 1.5;
  if (d.features.length >= 3) s += 0.5;
  return Math.min(10, Math.round(s * 10) / 10);
}

function scoreClass(s: number): "low" | "mid" | "high" {
  if (s < 4) return "low";
  if (s < 7) return "mid";
  return "high";
}

function formatPrice(raw: string): string {
  const n = raw.replace(/\D/g, "");
  return n ? Number(n).toLocaleString("en-NG") : "";
}

function pricePlaceholder(cat: string): string {
  if (cat === "for-sale" || cat === "land")   return "e.g. 45,000,000";
  if (cat === "for-rent")                     return "e.g. 2,500,000";
  if (cat === "short-let")                    return "e.g. 35,000";
  if (cat === "event-venue")                  return "e.g. 150,000";
  return "e.g. 3,500,000";
}

function priceSuggestion(draft: Draft): string {
  if (draft.category === "for-sale")
    return "Similar listings in this area: ₦18m – ₦250m";
  if (draft.category === "for-rent")
    return "Similar rentals nearby: ₦800k – ₦8m per year";
  if (draft.category === "short-let")
    return "Short-lets in this area: ₦25k – ₦120k per night";
  if (draft.category === "land")
    return "Land plots nearby: ₦5m – ₦80m depending on title";
  return "Similar commercial space: ₦2m – ₦15m per year";
}

/* ── Component ──────────────────────────────────────────────────── */

interface Props {
  user: AuthUser;
  marketSlug: string;
  editId?: number;
  initialDraft?: Record<string, unknown>;
}

const PERIOD_MAP: Record<string, string> = {
  "Outright": "", "Per year": "/year", "Per month": "/year",
  "Per night": "/night", "Per week": "/night",
  "Per event": "/day", "Per day": "/day",
};

export function ListingWizard({ user, marketSlug, editId, initialDraft }: Props) {
  const isEdit = !!editId;
  const [step, setStep] = useState(isEdit ? 2 : 1);
  const [draft, setDraft] = useState<Draft>({ ...BLANK, ...(initialDraft as Partial<Draft>) });
  const [submitted, setSubmitted] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const up  = (patch: Partial<Draft>) => setDraft(p => ({ ...p, ...patch }));
  const next = () => setStep(s => Math.min(7, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const toggleArr = (key: keyof Draft, val: string) => {
    const arr = (draft[key] as string[]);
    up({ [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };

  const score    = computeScore(draft);
  const scoreCls = scoreClass(score);
  const cat      = CATEGORIES.find(c => c.key === draft.category);
  const periods  = cat?.pricePeriods ?? ["Per year"];
  const lgas     = getLgas(draft.state);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (fileRef.current) fileRef.current.value = "";

    const remaining = 20 - draft.photos.length;
    if (remaining <= 0) return;
    const batch = files.slice(0, remaining);

    setUploading(true);

    const { getAccessToken } = await import("@/lib/supabase-client");
    const token = await getAccessToken();
    if (!token) {
      toast.error("Sign in required to upload photos.");
      setUploading(false);
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const urls: string[] = [];
    const errs: string[] = [];

    for (const file of batch) {
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("purpose", "listing");
        const res = await fetch(`${apiBase}/api/v1/upload/photo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string };
          errs.push(body.error ?? `${file.name} failed`);
        } else {
          const { url } = await res.json() as { url: string };
          urls.push(url);
        }
      } catch {
        errs.push(`${file.name}: network error`);
      }
    }

    if (urls.length) {
      setDraft(prev => ({ ...prev, photos: [...prev.photos, ...urls].slice(0, 20) }));
      toast.success(
        urls.length === 1
          ? "Photo uploaded"
          : `${urls.length} photos uploaded`,
      );
    }
    if (errs.length) {
      toast.error(`Upload failed: ${errs.join(", ")}`, { duration: 6000 });
    }
    setUploading(false);
  };

  const checks = [
    { label: "Category selected",  done: !!draft.category },
    { label: "Location filled",     done: !!(draft.state && draft.neighbourhood) },
    { label: "Price entered",       done: !!draft.price },
    { label: "At least 1 photo",    done: draft.photos.length >= 1 },
    { label: "5+ photos",           done: draft.photos.length >= 5 },
    { label: "Title & description", done: draft.title.length > 10 && draft.description.length > 100 },
    { label: "3+ feature tags",     done: draft.features.length >= 3 },
  ];

  /* ── SUCCESS ── */
  if (submitted) {
    const title = isEdit ? "Listing updated!" : (user.identityVerified ? "Listing submitted!" : "Draft saved!");
    const body = isEdit
      ? "Your changes are live. Buyers will see the updated version immediately."
      : user.identityVerified
        ? "Your listing is being reviewed. It will go live within 2 hours and we'll email you the moment it's published."
        : "Your listing is saved as a draft. Complete identity verification and it goes live automatically — with a trust seal that drives 4× more enquiries.";
    return (
      <div style={{ minHeight: "100dvh", background: "var(--ground)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 480, textAlign: "center", padding: "0 24px" }}>
          <div style={{
            width: 80, height: 80, borderRadius: 22, margin: "0 auto 28px",
            background: "linear-gradient(135deg, var(--forest), var(--forest-2))",
            display: "grid", placeItems: "center", color: "#fff",
            boxShadow: "var(--shadow-brand)",
          }}>
            <Check size={40} strokeWidth={2} />
          </div>
          <h1 style={{ fontFamily: "var(--font-fraunces),sans-serif", fontSize: 30, fontWeight: 700, color: "var(--ink)", marginBottom: 12, letterSpacing: "-0.02em" }}>
            {title}
          </h1>
          <p style={{ fontSize: 15, color: "var(--clay)", lineHeight: 1.7, marginBottom: 32 }}>{body}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`/${marketSlug}/dashboard`} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--forest)", color: "#fff", padding: "12px 24px",
              borderRadius: 12, fontFamily: "var(--font-fraunces),sans-serif",
              fontWeight: 600, fontSize: 15, textDecoration: "none", boxShadow: "var(--shadow-brand)",
            }}>
              Go to dashboard <ChevronRight size={16} strokeWidth={2} />
            </Link>
            {!isEdit && !user.identityVerified && (
              <Link href={`/${marketSlug}/verify`} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: "1.5px solid var(--forest)", color: "var(--forest)", padding: "12px 24px",
                borderRadius: 12, fontFamily: "var(--font-fraunces),sans-serif",
                fontWeight: 600, fontSize: 15, textDecoration: "none",
              }}>
                <ShieldCheck size={15} strokeWidth={2} /> Verify now
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lw-root">

      {/* ── HEADER ── */}
      <div className="lw-header">
        <div className="lw-header-inner">
          <Link href={`/${marketSlug}`} className="lw-logo">
            <LogoMark size={28} />
            <span className="lw-logo-name">MyPropertyConnect</span>
          </Link>
          <div className="lw-steps">
            {STEPS.map(s => (
              <div key={s.num} className={`lw-step-item${step === s.num ? " active" : ""}${s.num < step ? " done" : ""}`}>
                <div className="lw-step-num">
                  {s.num < step ? <Check size={12} strokeWidth={3} /> : s.num}
                </div>
                <span className="lw-step-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="lw-body">
        <div className="lw-card">

          {/* ══ STEP 1: CATEGORY ══ */}
          {step === 1 && (
            <div className="lw-step-content">
              <div className="lw-step-eyebrow">Step 1 of 7</div>
              <h2 className="lw-step-title">What are you listing?</h2>
              <p className="lw-step-sub">Your form fields adapt to your category — you only fill in what's relevant.</p>
              <div className="lw-cat-grid">
                {CATEGORIES.map(({ key, Icon, title, blurb, pricePeriods }) => (
                  <div
                    key={key}
                    className={`lw-cat-tile${draft.category === key ? " selected" : ""}${isEdit ? " disabled" : ""}`}
                    onClick={() => !isEdit && up({ category: key, period: pricePeriods[0] })}
                    style={isEdit ? { pointerEvents: "none", opacity: draft.category === key ? 1 : 0.35 } : undefined}
                  >
                    <div className="lw-cat-icon"><Icon size={20} strokeWidth={1.8} /></div>
                    <div className="lw-cat-title">{title}</div>
                    <div className="lw-cat-blurb">{blurb}</div>
                  </div>
                ))}
              </div>
              <div className="lw-nav">
                <button className="lw-btn lw-btn-primary" disabled={!draft.category} style={{ opacity: !draft.category ? 0.5 : 1 }} onClick={next}>
                  Continue <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2: LOCATION ══ */}
          {step === 2 && (
            <div className="lw-step-content">
              <div className="lw-step-eyebrow">Step 2 of 7</div>
              <h2 className="lw-step-title">Where is the property?</h2>
              <p className="lw-step-sub">Be specific — buyers search by neighbourhood and buyers filter by LGA.</p>

              <div className="lw-grid-2">
                <div className="lw-field">
                  <label className="lw-label">State <sup>*</sup></label>
                  <div className="lw-select-wrap">
                    <select className="lw-select" value={draft.state} onChange={e => up({ state: e.target.value, lga: "" })}>
                      <option value="">Select state</option>
                      {NG_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="lw-field">
                  <label className="lw-label">LGA / Area council <sup>*</sup></label>
                  {lgas.length > 0 ? (
                    <div className="lw-select-wrap">
                      <select className="lw-select" value={draft.lga} onChange={e => up({ lga: e.target.value })}>
                        <option value="">Select LGA</option>
                        {lgas.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  ) : (
                    <input className="lw-input" type="text" placeholder="e.g. GRA Phase 2" value={draft.lga} onChange={e => up({ lga: e.target.value })} />
                  )}
                </div>
              </div>
              <div className="lw-field">
                <label className="lw-label">Neighbourhood <sup>*</sup></label>
                <input className="lw-input" type="text" placeholder="e.g. Lekki Phase 1, Maitama, Old GRA" value={draft.neighbourhood} onChange={e => up({ neighbourhood: e.target.value })} />
              </div>
              <div className="lw-field">
                <label className="lw-label">Street address <sup>*</sup></label>
                <input className="lw-input" type="text" placeholder="e.g. 12 Akin Adesola Street" value={draft.address} onChange={e => up({ address: e.target.value })} />
              </div>
              <div className="lw-field">
                <label className="lw-label">Nearest landmark <span className="lw-optional">(optional)</span></label>
                <input className="lw-input" type="text" placeholder="e.g. Beside Shoprite Lekki" value={draft.landmark} onChange={e => up({ landmark: e.target.value })} />
              </div>

              <div className="lw-nav">
                <button className="lw-btn lw-btn-back" onClick={back}>
                  <ChevronLeft size={16} strokeWidth={2} /> Back
                </button>
                <button
                  className="lw-btn lw-btn-primary"
                  disabled={!(draft.state && draft.lga && draft.neighbourhood && draft.address)}
                  style={{ opacity: !(draft.state && draft.lga && draft.neighbourhood && draft.address) ? 0.5 : 1 }}
                  onClick={next}
                >
                  Continue <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 3: DETAILS ══ */}
          {step === 3 && (
            <div className="lw-step-content">
              <div className="lw-step-eyebrow">Step 3 of 7</div>
              <h2 className="lw-step-title">Property details</h2>
              <p className="lw-step-sub">More detail means a higher quality score and more enquiries.</p>

              {/* Residential */}
              {isResidential(draft.category) && (
                <>
                  <div className="lw-field">
                    <label className="lw-label">Building type</label>
                    <div className="lw-seg">
                      {BUILDING_TYPES.map(t => (
                        <button key={t} className={`lw-seg-btn${draft.buildingType === t ? " active" : ""}`} onClick={() => up({ buildingType: t })}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="lw-grid-3">
                    <div className="lw-field">
                      <label className="lw-label">Bedrooms</label>
                      <div className="lw-select-wrap">
                        <select className="lw-select" value={draft.beds} onChange={e => up({ beds: e.target.value })}>
                          <option value="">—</option>
                          {["Studio","1","2","3","4","5","6","7+"].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="lw-field">
                      <label className="lw-label">Bathrooms</label>
                      <div className="lw-select-wrap">
                        <select className="lw-select" value={draft.baths} onChange={e => up({ baths: e.target.value })}>
                          <option value="">—</option>
                          {["1","2","3","4","5","6+"].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="lw-field">
                      <label className="lw-label">Toilets</label>
                      <div className="lw-select-wrap">
                        <select className="lw-select" value={draft.toilets} onChange={e => up({ toilets: e.target.value })}>
                          <option value="">—</option>
                          {["1","2","3","4","5","6+"].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="lw-grid-2">
                    <div className="lw-field">
                      <label className="lw-label">Total area (sqm) <span className="lw-optional">(optional)</span></label>
                      <input className="lw-input" type="number" min="0" placeholder="e.g. 240" value={draft.sqm} onChange={e => up({ sqm: e.target.value })} />
                    </div>
                    <div className="lw-field">
                      <label className="lw-label">Parking spaces <span className="lw-optional">(optional)</span></label>
                      <div className="lw-select-wrap">
                        <select className="lw-select" value={draft.parking} onChange={e => up({ parking: e.target.value })}>
                          <option value="">—</option>
                          {["0","1","2","3","4","5+"].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="lw-field">
                    <label className="lw-label">Furnishing</label>
                    <div className="lw-seg">
                      {FURNISHING_OPTS.map(f => (
                        <button key={f} className={`lw-seg-btn${draft.furnishing === f ? " active" : ""}`} onClick={() => up({ furnishing: f })}>{f}</button>
                      ))}
                    </div>
                  </div>
                  {draft.category !== "for-sale" && (
                    <div className="lw-field">
                      <label className="lw-label">Floor number <span className="lw-optional">(for apartments, optional)</span></label>
                      <input className="lw-input" type="number" min="0" placeholder="e.g. 3" value={draft.floor} onChange={e => up({ floor: e.target.value })} />
                    </div>
                  )}
                </>
              )}

              {/* Land */}
              {isLand(draft.category) && (
                <>
                  <div className="lw-grid-2">
                    <div className="lw-field">
                      <label className="lw-label">Plot size <sup>*</sup></label>
                      <input className="lw-input" type="text" placeholder="e.g. 648" value={draft.plotSize} onChange={e => up({ plotSize: e.target.value })} />
                    </div>
                    <div className="lw-field">
                      <label className="lw-label">Unit</label>
                      <div className="lw-select-wrap">
                        <select className="lw-select" value={draft.plotUnit} onChange={e => up({ plotUnit: e.target.value })}>
                          {["sqm","plots","acres","hectares"].map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="lw-field">
                    <label className="lw-label">Title type <sup>*</sup></label>
                    <div className="lw-seg">
                      {LAND_TITLES.map(t => (
                        <button key={t} className={`lw-seg-btn${draft.titleType === t ? " active" : ""}`} onClick={() => up({ titleType: t })}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="lw-field">
                    <label className="lw-label">Land features</label>
                    <div className="lw-tags">
                      {LAND_FEATURES.map(f => (
                        <button key={f} className={`lw-tag${draft.landFeatures.includes(f) ? " active" : ""}`} onClick={() => toggleArr("landFeatures", f)}>{f}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Commercial */}
              {isCommercial(draft.category) && (
                <>
                  <div className="lw-grid-2">
                    <div className="lw-field">
                      <label className="lw-label">Floor area (sqm) <sup>*</sup></label>
                      <input className="lw-input" type="number" min="0" placeholder="e.g. 500" value={draft.floorArea} onChange={e => up({ floorArea: e.target.value })} />
                    </div>
                    <div className="lw-field">
                      <label className="lw-label">Floor level <span className="lw-optional">(optional)</span></label>
                      <input className="lw-input" type="number" min="0" placeholder="e.g. 4" value={draft.floorLevel} onChange={e => up({ floorLevel: e.target.value })} />
                    </div>
                  </div>
                  <div className="lw-field">
                    <label className="lw-label">Condition / Fitting</label>
                    <div className="lw-seg">
                      {COMM_CONDITIONS.map(c => (
                        <button key={c} className={`lw-seg-btn${draft.condition === c ? " active" : ""}`} onClick={() => up({ condition: c })}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div className="lw-field">
                    <label className="lw-label">Parking spaces <span className="lw-optional">(optional)</span></label>
                    <div className="lw-select-wrap">
                      <select className="lw-select" value={draft.parking} onChange={e => up({ parking: e.target.value })}>
                        <option value="">—</option>
                        {["0","1","2","3","4","5+","10+"].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Event venue */}
              {isVenue(draft.category) && (
                <>
                  <div className="lw-grid-2">
                    <div className="lw-field">
                      <label className="lw-label">Capacity (guests) <sup>*</sup></label>
                      <input className="lw-input" type="number" min="1" placeholder="e.g. 500" value={draft.capacity} onChange={e => up({ capacity: e.target.value })} />
                    </div>
                    <div className="lw-field">
                      <label className="lw-label">Venue type</label>
                      <div className="lw-select-wrap">
                        <select className="lw-select" value={draft.venueType} onChange={e => up({ venueType: e.target.value })}>
                          {["Indoor","Outdoor","Indoor & Outdoor"].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="lw-field">
                    <label className="lw-label">Setup styles available</label>
                    <div className="lw-tags">
                      {VENUE_SETUPS.map(s => (
                        <button key={s} className={`lw-tag${draft.setupStyles.includes(s) ? " active" : ""}`} onClick={() => toggleArr("setupStyles", s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="lw-field">
                    <label className="lw-label">Amenities</label>
                    <div className="lw-tags">
                      {VENUE_AMENITIES.map(a => (
                        <button key={a} className={`lw-tag${draft.venueAmenities.includes(a) ? " active" : ""}`} onClick={() => toggleArr("venueAmenities", a)}>{a}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="lw-nav">
                <button className="lw-btn lw-btn-back" onClick={back}><ChevronLeft size={16} strokeWidth={2} /> Back</button>
                <button className="lw-btn lw-btn-primary" onClick={next}>Continue <ChevronRight size={16} strokeWidth={2} /></button>
              </div>
            </div>
          )}

          {/* ══ STEP 4: PRICING ══ */}
          {step === 4 && (
            <div className="lw-step-content">
              <div className="lw-step-eyebrow">Step 4 of 7</div>
              <h2 className="lw-step-title">Pricing</h2>
              <p className="lw-step-sub">We show a local market range to help you price competitively.</p>

              <div className="lw-field">
                <label className="lw-label">{cat?.priceLabel ?? "Price"} <sup>*</sup></label>
                <div className="lw-price-wrap">
                  <span className="lw-currency">₦</span>
                  <input
                    className="lw-input lw-price-input"
                    type="text"
                    inputMode="numeric"
                    placeholder={pricePlaceholder(draft.category)}
                    value={draft.price}
                    onChange={e => up({ price: formatPrice(e.target.value) })}
                  />
                </div>
              </div>

              {periods.length > 1 && (
                <div className="lw-field">
                  <label className="lw-label">Payment period</label>
                  <div className="lw-seg">
                    {periods.map(p => (
                      <button key={p} className={`lw-seg-btn${draft.period === p ? " active" : ""}`} onClick={() => up({ period: p })}>{p}</button>
                    ))}
                  </div>
                </div>
              )}

              {draft.price && (
                <div className="lw-price-hint">
                  <TrendingUp size={16} strokeWidth={2} className="lw-price-hint-icon" />
                  <div>
                    <div className="lw-price-hint-text">
                      Market range for <strong>{draft.neighbourhood || draft.lga || draft.state}</strong>:
                    </div>
                    <div className="lw-price-hint-range">{priceSuggestion(draft)}</div>
                  </div>
                </div>
              )}

              <div className="lw-toggle-row" style={{ marginTop: 20 }} onClick={() => up({ negotiable: !draft.negotiable })}>
                <div>
                  <div className="lw-toggle-label">Price is negotiable</div>
                  <div className="lw-toggle-sub">Buyers can send you an offer below the asking price</div>
                </div>
                <div className={`lw-toggle-switch${draft.negotiable ? " on" : ""}`} />
              </div>

              {(["for-rent","office","retail"].includes(draft.category)) && (
                <div className="lw-field" style={{ marginTop: 16 }}>
                  <label className="lw-label">Annual service charge <span className="lw-optional">(optional)</span></label>
                  <div className="lw-price-wrap">
                    <span className="lw-currency">₦</span>
                    <input
                      className="lw-input lw-price-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 300,000"
                      value={draft.serviceCharge}
                      onChange={e => up({ serviceCharge: formatPrice(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              <div className="lw-nav">
                <button className="lw-btn lw-btn-back" onClick={back}><ChevronLeft size={16} strokeWidth={2} /> Back</button>
                <button className="lw-btn lw-btn-primary" disabled={!draft.price} style={{ opacity: !draft.price ? 0.5 : 1 }} onClick={next}>
                  Continue <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 5: PHOTOS ══ */}
          {step === 5 && (
            <div className="lw-step-content">
              <div className="lw-step-eyebrow">Step 5 of 7</div>
              <h2 className="lw-step-title">Photos &amp; media</h2>
              <p className="lw-step-sub">Listings with 10+ photos get 3× more enquiries. Main photo appears first.</p>

              <div
                className="lw-photo-zone"
                onClick={() => !uploading && fileRef.current?.click()}
                style={uploading ? { opacity: 0.6, cursor: "wait" } : undefined}
              >
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} disabled={uploading} />
                <div className="lw-photo-zone-icon"><ImagePlus size={26} strokeWidth={1.5} /></div>
                <div className="lw-photo-zone-title">
                  {uploading
                    ? "Uploading…"
                    : draft.photos.length === 0
                      ? "Add photos"
                      : `${draft.photos.length} / 20 photos added`}
                </div>
                <div className="lw-photo-zone-sub">
                  {uploading ? "Please wait" : "Click or drag to upload JPG, PNG, HEIC"}
                </div>
              </div>

              {draft.photos.length > 0 && (
                <div className="lw-photo-grid">
                  {draft.photos.map((url, i) => (
                    <div key={url} className="lw-photo-thumb">
                      <img
                        src={url.replace("/upload/", "/upload/w_200,h_160,c_fill/")}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      {i === 0 && <span className="lw-photo-main-badge">Main</span>}
                      <button className="lw-photo-del" onClick={e => { e.stopPropagation(); up({ photos: draft.photos.filter((_,j) => j !== i) }); }}>
                        <X size={10} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="lw-photo-tip">
                <Lightbulb size={14} strokeWidth={2} />
                Use bright, daytime photos. Avoid screenshots from WhatsApp or other platforms.
              </div>

              <div className="lw-nav">
                <button className="lw-btn lw-btn-back" onClick={back}><ChevronLeft size={16} strokeWidth={2} /> Back</button>
                <button
                  className="lw-btn lw-btn-primary"
                  disabled={uploading}
                  style={{ opacity: uploading ? 0.5 : 1 }}
                  onClick={next}
                >
                  {uploading ? "Uploading…" : draft.photos.length === 0 ? "Skip for now" : "Continue"} <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 6: DESCRIPTION ══ */}
          {step === 6 && (
            <div className="lw-step-content">
              <div className="lw-step-eyebrow">Step 6 of 7</div>
              <h2 className="lw-step-title">Title &amp; description</h2>
              <p className="lw-step-sub">A compelling description turns browsers into enquiries.</p>

              <div className="lw-field">
                <label className="lw-label">Listing title <sup>*</sup></label>
                <input
                  className="lw-input"
                  type="text"
                  placeholder={`e.g. Stunning 3-bedroom duplex in ${draft.neighbourhood || "Lekki Phase 1"}`}
                  maxLength={100}
                  value={draft.title}
                  onChange={e => up({ title: e.target.value })}
                />
                <div style={{ fontSize: 11, color: "var(--clay)", marginTop: 4 }}>{draft.title.length}/100</div>
              </div>

              <div className="lw-field">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <label className="lw-label" style={{ marginBottom: 0 }}>Full description <sup>*</sup></label>
                  <button
                    type="button"
                    className="lw-ai-btn"
                    disabled={aiLoading || !draft.category || !draft.state}
                    onClick={async () => {
                      setAiLoading(true);
                      const tid = toast.loading("Writing description…");
                      try {
                        const { getAccessToken } = await import("@/lib/supabase-client");
                        const token = await getAccessToken();
                        if (!token) throw new Error("Sign in required.");

                        const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
                        const res = await fetch(`${apiBase}/api/v1/ai/listing-description`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            category:      draft.category,
                            neighbourhood: draft.neighbourhood,
                            lga:           draft.lga,
                            state:         draft.state,
                            price:         draft.price,
                            period:        draft.period,
                            beds:          draft.beds,
                            baths:         draft.baths,
                            sqm:           draft.sqm,
                            buildingType:  draft.buildingType,
                            furnishing:    draft.furnishing,
                            titleType:     draft.titleType,
                            plotSize:      draft.plotSize,
                            plotUnit:      draft.plotUnit,
                            floorArea:     draft.floorArea,
                            condition:     draft.condition,
                            capacity:      draft.capacity,
                            venueType:     draft.venueType,
                            features:      draft.features,
                          }),
                        });

                        const body = await res.json() as { description?: string; error?: string };
                        if (!res.ok || !body.description) {
                          throw new Error(body.error ?? "Generation failed.");
                        }

                        up({ description: body.description });
                        toast.success("Description generated!", { id: tid });
                      } catch (e: unknown) {
                        toast.error(
                          e instanceof Error ? e.message : "AI generation failed.",
                          { id: tid, duration: 5000 },
                        );
                      } finally {
                        setAiLoading(false);
                      }
                    }}
                  >
                    <Sparkles size={13} strokeWidth={2} />
                    {aiLoading ? "Writing…" : draft.description ? "Rewrite with AI" : "Write with AI"}
                  </button>
                </div>
                <textarea
                  className="lw-textarea"
                  placeholder="Describe the property — location benefits, building quality, amenities, nearby landmarks, what makes it special…"
                  rows={7}
                  maxLength={2000}
                  value={draft.description}
                  onChange={e => up({ description: e.target.value })}
                />
                <div style={{ fontSize: 11, color: "var(--clay)", marginTop: 4 }}>
                  {draft.description.length}/2000 — aim for 150+ characters for a score above 7
                </div>
              </div>

              <div className="lw-field">
                <label className="lw-label">Key features <span className="lw-optional">(select all that apply)</span></label>
                <div className="lw-tags">
                  {PROP_FEATURES.map(f => (
                    <button key={f} className={`lw-tag${draft.features.includes(f) ? " active" : ""}`} onClick={() => toggleArr("features", f)}>{f}</button>
                  ))}
                </div>
              </div>

              <div className="lw-nav">
                <button className="lw-btn lw-btn-back" onClick={back}><ChevronLeft size={16} strokeWidth={2} /> Back</button>
                <button
                  className="lw-btn lw-btn-primary"
                  disabled={!(draft.title.length > 5 && draft.description.length > 30)}
                  style={{ opacity: !(draft.title.length > 5 && draft.description.length > 30) ? 0.5 : 1 }}
                  onClick={next}
                >
                  Preview &amp; review <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 7: REVIEW ══ */}
          {step === 7 && (
            <div className="lw-step-content">
              <div className="lw-step-eyebrow">Step 7 of 7</div>
              <h2 className="lw-step-title">Review &amp; publish</h2>
              <p className="lw-step-sub">Check your listing one last time before it goes to our review team.</p>

              {/* Mini preview card */}
              <div className="lw-preview-wrap">
                <div className="lw-preview-label">How buyers see your listing</div>
                <div style={{ background: "var(--c-neutral-0)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
                  <div style={{
                    height: 160, position: "relative",
                    background: "linear-gradient(135deg,var(--line),var(--ground))",
                    display: "flex", alignItems: "flex-end", overflow: "hidden",
                  }}>
                    {draft.photos.length > 0 ? (
                      <img
                        src={draft.photos[0].replace("/upload/", "/upload/w_600,h_320,c_fill/")}
                        alt=""
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <ImagePlus size={28} style={{ color: "var(--clay)" }} strokeWidth={1.5} />
                        <span style={{ fontSize: 11, color: "var(--clay)" }}>No photos yet</span>
                      </div>
                    )}
                    <div style={{ padding: "8px 12px", display: "flex", gap: 6 }}>
                      <span style={{ background: "var(--forest)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, textTransform: "capitalize" }}>
                        {(draft.category || "listing").replace(/-/g," ")}
                      </span>
                      {draft.photos.length > 0 && (
                        <span style={{ background: "rgba(0,0,0,.45)", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 4 }}>
                          {draft.photos.length} photos
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ fontFamily: "var(--font-fraunces),sans-serif", fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                      {draft.price ? `₦${draft.price}` : "—"}
                      {draft.period !== "Outright" && <span style={{ fontSize: 13, fontWeight: 400, color: "var(--clay)", marginLeft: 4 }}>{draft.period.toLowerCase()}</span>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>
                      {draft.title || "Your listing title will appear here"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--clay)" }}>
                      <MapPin size={11} strokeWidth={2} style={{ color: "var(--forest)", flexShrink: 0 }} />
                      {[draft.neighbourhood, draft.state].filter(Boolean).join(", ") || "Location not set"}
                    </div>
                    {isResidential(draft.category) && (draft.beds || draft.baths) && (
                      <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12 }}>
                        {draft.beds  && <span style={{ color: "var(--forest)", fontWeight: 500 }}>{draft.beds} bed</span>}
                        {draft.baths && <span style={{ color: "var(--forest)", fontWeight: 500 }}>{draft.baths} bath</span>}
                        {draft.sqm   && <span style={{ color: "var(--clay)" }}>{draft.sqm} sqm</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Completion checklist */}
              <div className="lw-review-checklist">
                {checks.map(({ label, done }) => (
                  <div key={label} className={`lw-rc-item${done ? " ok" : " warn"}`}>
                    <div className="lw-rc-icon">
                      {done
                        ? <Check size={14} strokeWidth={2.5} style={{ color: "var(--forest)" }} />
                        : <Info  size={14} strokeWidth={2}   style={{ color: "var(--clay)"  }} />
                      }
                    </div>
                    {label}
                  </div>
                ))}
              </div>

              {/* Verification gate — new listings only */}
              {!isEdit && !user.identityVerified && (
                <div className="lw-verify-gate">
                  <div className="lw-vg-icon">
                    <ShieldCheck size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="lw-vg-title">Verify your identity to go live</div>
                    <div className="lw-vg-text">
                      Your listing will be saved as a <strong>draft</strong> until you complete ID verification.
                      Once verified, it goes live automatically with a trust seal — which earns 4× more enquiries than unverified listings.
                    </div>
                    <Link href={`/${marketSlug}/verify`} className="lw-vg-link">
                      <ShieldCheck size={14} strokeWidth={2} /> Start verification
                    </Link>
                  </div>
                </div>
              )}

              <div className="lw-nav">
                <button className="lw-btn lw-btn-back" onClick={back}><ChevronLeft size={16} strokeWidth={2} /> Back</button>
                <button
                  className={`lw-btn ${isEdit || user.identityVerified ? "lw-btn-primary" : "lw-btn-gold"}`}
                  disabled={publishing}
                  style={{ opacity: publishing ? 0.7 : 1 }}
                  onClick={async () => {
                    setPublishing(true);
                    const tid = toast.loading(
                      isEdit ? "Saving changes…" : "Publishing listing…",
                    );
                    try {
                      const { getAccessToken } = await import("@/lib/supabase-client");
                      const { api } = await import("@/lib/api");
                      const token = await getAccessToken();
                      if (!token) throw new Error("Please sign in again.");

                      const payload = {
                        title:         draft.title,
                        neighbourhood: draft.neighbourhood,
                        lga:           draft.lga,
                        state:         draft.state,
                        price:         Number(draft.price.replace(/,/g, "")),
                        period:        PERIOD_MAP[draft.period] ?? "/year",
                        beds:          Number(draft.beds)    || 0,
                        baths:         Number(draft.baths)   || 0,
                        toilets:       Number(draft.toilets) || 0,
                        description:   draft.description,
                        photo_urls:    draft.photos,
                        attrs: [
                          draft.buildingType && { k: "Building type", v: draft.buildingType },
                          draft.furnishing   && { k: "Furnishing",    v: draft.furnishing   },
                          draft.sqm          && { k: "Size",          v: `${draft.sqm} sqm` },
                          draft.titleType    && { k: "Title document",v: draft.titleType    },
                          draft.condition    && { k: "Condition",     v: draft.condition    },
                        ].filter(Boolean),
                      };

                      if (isEdit) {
                        await api.patch(`/api/v1/listings/${editId}`, payload, token);
                      } else {
                        await api.post("/api/v1/listings", {
                          ...payload,
                          market_id:     marketSlug,
                          category_slug: draft.category,
                        }, token);
                      }

                      // Bust Next.js Router Cache so browse pages show the listing immediately
                      void revalidateAfterPublish(marketSlug, draft.category, draft.state);

                      toast.success(
                        isEdit
                          ? "Changes saved!"
                          : user.identityVerified
                            ? "Listing published!"
                            : "Draft saved — verify your ID to go live",
                        { id: tid, duration: 4000 },
                      );
                      setSubmitted(true);
                    } catch (e: unknown) {
                      toast.error(
                        e instanceof Error ? e.message : "Publish failed. Please try again.",
                        { id: tid, duration: 6000 },
                      );
                    } finally {
                      setPublishing(false);
                    }
                  }}
                >
                  {publishing
                    ? (isEdit ? "Saving…" : "Publishing…")
                    : isEdit
                      ? <><span>Save changes</span> <ChevronRight size={16} strokeWidth={2} /></>
                      : user.identityVerified
                        ? <><span>Publish listing</span> <ChevronRight size={16} strokeWidth={2} /></>
                        : <><span>Save as draft</span>   <ChevronRight size={16} strokeWidth={2} /></>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="lw-sidebar">
          <div className="lw-score-card">
            <div className="lw-score-label">Listing quality score</div>
            <div className={`lw-score-num ${scoreCls}`}>{score.toFixed(1)}</div>
            <div style={{ fontSize: 12, color: "var(--clay)", marginBottom: 12, lineHeight: 1.4 }}>
              {score < 4
                ? "Fill in more details to improve your score"
                : score < 7
                ? "Getting there — add photos and description"
                : "Excellent! Your listing will stand out"}
            </div>
            <div className="lw-score-track">
              <div className={`lw-score-fill ${scoreCls}`} style={{ width: `${(score / 10) * 100}%` }} />
            </div>
            <div className="lw-score-checklist">
              {checks.map(({ label, done }) => (
                <div key={label} className={`lw-score-check${done ? " done" : ""}`}>
                  <div className="lw-score-check-icon">{done && <Check size={8} strokeWidth={3} />}</div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="lw-help-card">
            <div className="lw-help-title">Tips for more enquiries</div>
            <div className="lw-help-item">Use bright, daytime photos from multiple angles</div>
            <div className="lw-help-item">Write 150+ characters in your description</div>
            <div className="lw-help-item">Add the exact street address — it builds trust</div>
            <div className="lw-help-item">Tag all available features and amenities</div>
            {!user.identityVerified && (
              <div className="lw-help-item" style={{ color: "var(--gold-deep)", fontWeight: 600 }}>
                Verify your ID to earn 4× more enquiries
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
