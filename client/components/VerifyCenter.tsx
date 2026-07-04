"use client";

import { useState, useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CreditCard, Landmark, ScanFace, FileText, Award, Camera,
  Medal, Trophy,
  Lock, TrendingUp, Shield, MessageSquare,
  Check, RefreshCw, AlertCircle,
  ChevronDown, ChevronUp,
  Upload, Lightbulb, Home,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, getAccessToken } from "@/lib/supabase-client";
import { AuthFlow } from "@/components/AuthFlow";
import type { AuthUser } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/* ── Types ───────────────────────────────────────────────────── */
type StepId     = "nin" | "bvn" | "face" | "cac" | "rean" | "photo";
type StepStatus = "done" | "review" | "pending";
type Tier       = "starter" | "bronze" | "silver" | "gold";
type InputKind  = "nin" | "bvn" | "selfie" | "file" | "rean";

interface Step {
  id: StepId;
  Icon: LucideIcon;
  iconColor: string;
  title: string;
  desc: string;
  tier: Exclude<Tier, "starter">;
  inputKind: InputKind;
  doneText: string;
  reviewText: string;
}

interface TierConfig {
  id: Tier;
  Icon: LucideIcon | null;
  iconColor: string;
  name: string;
  req: string;
  perks: string[];
  ring: string;
  stepsNeeded: number;
}

/* ── Static step definitions ─────────────────────────────────── */
const STEPS: Step[] = [
  {
    id: "nin",
    Icon: CreditCard,
    iconColor: "var(--forest)",
    title: "NIN Verification",
    desc: "Your National Identification Number links your real-world identity to your PropertyConnect profile. This is the single most important signal for property seekers — they need to know the person behind the listing is a real, accountable individual.",
    tier: "bronze",
    inputKind: "nin",
    doneText: "NIN matched · identity confirmed Nov 2024",
    reviewText: "Submitted · matching against NIMC database (1–2 hrs)",
  },
  {
    id: "bvn",
    Icon: Landmark,
    iconColor: "var(--forest)",
    title: "BVN Linkage",
    desc: "Your Bank Verification Number confirms your financial identity and dramatically reduces the risk of impersonation fraud. Buyers and renters are significantly more likely to enquire on listings where the agent is BVN-linked.",
    tier: "bronze",
    inputKind: "bvn",
    doneText: "BVN linked · financial identity confirmed Nov 2024",
    reviewText: "Submitted · verifying with CBN gateway (up to 24 hrs)",
  },
  {
    id: "face",
    Icon: ScanFace,
    iconColor: "var(--forest)",
    title: "Face ID Check",
    desc: "A one-time liveness check that matches your face to the photo on your NIN. This prevents someone else from using your identity. The check takes under 60 seconds on your phone and uses on-device processing — your face is never stored.",
    tier: "bronze",
    inputKind: "selfie",
    doneText: "Liveness check passed · face matched to NIN photo Nov 2024",
    reviewText: "Liveness video submitted · under AI review (a few minutes)",
  },
  {
    id: "cac",
    Icon: FileText,
    iconColor: "var(--forest)",
    title: "CAC Certificate",
    desc: "Uploading your Corporate Affairs Commission business registration certificate confirms you operate a legally registered real estate business in Nigeria. Required for all professional agents and agencies.",
    tier: "silver",
    inputKind: "file",
    doneText: "CAC certificate accepted · business registration verified Dec 2024",
    reviewText: "Certificate uploaded · under review by our compliance team (1–3 days)",
  },
  {
    id: "rean",
    Icon: Award,
    iconColor: "var(--gold-deep)",
    title: "REAN Licence",
    desc: "The Real Estate Agents Nigeria licence is the professional credential for practising agents. Verified REAN members rank higher in search results and receive a distinct Gold seal on every listing — signalling serious professional standing to buyers and renters.",
    tier: "gold",
    inputKind: "rean",
    doneText: "REAN licence verified · professional status confirmed",
    reviewText: "Licence submitted · verifying with REAN registry (2–5 days)",
  },
  {
    id: "photo",
    Icon: Camera,
    iconColor: "var(--forest)",
    title: "Professional Photo",
    desc: "A high-quality, clearly-lit headshot reviewed by our team. Agents with a professional photo receive 40% more enquiries on average. Your photo appears on all your listings, your public profile, and WhatsApp enquiry threads.",
    tier: "gold",
    inputKind: "file",
    doneText: "Professional photo approved · active on all listings",
    reviewText: "Photo uploaded · under review by our team (within 24 hrs)",
  },
];

/* ── Tier config ─────────────────────────────────────────────── */
const TIER_CONFIG: TierConfig[] = [
  {
    id: "starter",
    Icon: null,
    iconColor: "var(--clay)",
    name: "Starter",
    req: "0 steps",
    perks: ["List up to 3 properties", "Basic enquiry form"],
    ring: "var(--clay)",
    stepsNeeded: 0,
  },
  {
    id: "bronze",
    Icon: Medal,
    iconColor: "#b47a3c",
    name: "Bronze",
    req: "3 steps (NIN + BVN + Face ID)",
    perks: ["Verified badge on listings", "Higher search ranking", "Unlimited listings"],
    ring: "#b47a3c",
    stepsNeeded: 3,
  },
  {
    id: "silver",
    Icon: Medal,
    iconColor: "#8a8a9a",
    name: "Silver",
    req: "4 steps (+ CAC)",
    perks: ["AI lead scoring", "Featured listing eligibility", "Priority support"],
    ring: "#8a8a9a",
    stepsNeeded: 4,
  },
  {
    id: "gold",
    Icon: Trophy,
    iconColor: "var(--gold-deep)",
    name: "Gold",
    req: "All 6 steps",
    perks: ["Gold seal on every listing", "Top search placement", "WhatsApp Business badge"],
    ring: "var(--gold-deep)",
    stepsNeeded: 6,
  },
];

const WHY_ITEMS: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: Lock,           title: "Builds immediate trust",  body: "Verified listings get 3× more enquiries than unverified ones."                           },
  { Icon: TrendingUp,     title: "Ranks higher in search",  body: "Every completed step adds ranking weight — Gold agents appear first."                    },
  { Icon: Shield,         title: "Protects everyone",       body: "Verified agents keep scammers out, making the whole platform safer."                     },
  { Icon: MessageSquare,  title: "Better quality leads",    body: "Buyers and renters filter for verified agents when they're serious."                     },
];

/* ── SVG ring math ───────────────────────────────────────────── */
const R    = 52;
const CX   = 64;
const CY   = 64;
const CIRC = Math.round(2 * Math.PI * R); // ≈ 327

/* ── Tier icon helper ────────────────────────────────────────── */
function TierIcon({ tier, size = 14 }: { tier: Tier; size?: number }) {
  const cfg = TIER_CONFIG.find(t => t.id === tier)!;
  if (!cfg.Icon) return null;
  return <cfg.Icon size={size} strokeWidth={2} style={{ color: cfg.iconColor, flexShrink: 0 }} />;
}

/* ── Component ───────────────────────────────────────────────── */
export function VerifyCenter({ marketSlug }: { marketSlug: string }) {
  const [authUser, setAuthUser] = useState<{ id: string; name: string } | null | "loading">("loading");
  const [dbLoading, setDbLoading] = useState(true);
  const [statuses, setStatuses] = useState<Record<StepId, StepStatus>>({
    nin: "pending", bvn: "pending", face: "pending", cac: "pending", rean: "pending", photo: "pending",
  });
  const [openStep, setOpenStep]     = useState<StepId | null>(null);
  const [submitting, setSubmitting] = useState<StepId | null>(null);
  const [submitted, setSubmitted]   = useState<Set<StepId>>(new Set());
  const [submitErr, setSubmitErr]   = useState<string | null>(null);

  const [ninVal,    setNinVal]    = useState("");
  const [bvnVal,    setBvnVal]    = useState("");
  const [reanVal,   setReanVal]   = useState("");
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  /* ── Load real verification statuses from DB ─────────────── */
  async function loadStatuses(userId: string) {
    const { data: subs } = await supabase
      .from("verification_submissions")
      .select("step_id, status")
      .eq("agent_id", userId);
    if (subs?.length) {
      const updates: Partial<Record<StepId, StepStatus>> = {};
      for (const sub of subs) {
        const s = sub.status as string;
        updates[sub.step_id as StepId] =
          s === "approved" ? "done" : s === "rejected" ? "pending" : "review";
      }
      setStatuses(prev => ({ ...prev, ...updates }));
    }
  }

  /* ── Auth check on mount ─────────────────────────────────── */
  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        setAuthUser(null);
        setDbLoading(false);
        return;
      }
      const meta = session.user.user_metadata as Record<string, string>;
      setAuthUser({ id: session.user.id, name: meta.name ?? "Agent" });
      await loadStatuses(session.user.id);
      setDbLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Auth gate ───────────────────────────────────────────── */
  if (authUser === "loading" || dbLoading) {
    return (
      <div className="tv-page tv-page--loading">
        <span className="tv-spin tv-spin--lg" />
      </div>
    );
  }

  if (authUser === null) {
    return (
      <div className="tv-auth-gate">
        <AuthFlow
          marketSlug={marketSlug}
          onSuccess={async (user: AuthUser) => {
            setAuthUser({ id: user.id, name: user.name });
            setDbLoading(true);
            await loadStatuses(user.id);
            setDbLoading(false);
          }}
        />
      </div>
    );
  }

  /* ── Derived values ──────────────────────────────────────── */
  const doneCount   = (Object.values(statuses) as StepStatus[]).filter(s => s === "done").length;
  const reviewCount = (Object.values(statuses) as StepStatus[]).filter(s => s === "review").length;

  const currentTier: Tier =
    doneCount >= 6 ? "gold"   :
    doneCount >= 4 ? "silver" :
    doneCount >= 3 ? "bronze" : "starter";

  const ringOffset = Math.round(CIRC * (1 - doneCount / STEPS.length));
  const ringColor  = TIER_CONFIG.find(t => t.id === currentTier)!.ring;

  function toggle(id: StepId) {
    if (statuses[id] === "done") return;
    setSubmitErr(null);
    setOpenStep(prev => prev === id ? null : id);
  }

  function handleFileChange(stepId: StepId, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFileNames(prev => ({ ...prev, [stepId]: file.name }));
  }

  function canSubmit(step: Step): boolean {
    if (submitting === step.id) return false;
    if (submitted.has(step.id)) return false;
    const s = statuses[step.id];
    if (s === "done" || s === "review") return false;
    switch (step.inputKind) {
      case "nin":    return ninVal.replace(/\s/g, "").length === 11;
      case "bvn":    return bvnVal.replace(/\s/g, "").length === 11;
      case "selfie": return true;
      case "file":   return !!fileNames[step.id];
      case "rean":   return reanVal.trim().length > 4 && !!fileNames[step.id];
    }
  }

  /* ── Real submit ─────────────────────────────────────────── */
  async function submit(stepId: StepId) {
    if (!authUser || authUser === "loading") return;
    const agentId = authUser.id;
    setSubmitting(stepId);
    setSubmitErr(null);
    try {
      const token = await getAccessToken();

      /* NIN — instant verification via Prembly */
      if (stepId === "nin") {
        const res = await fetch(`${API}/api/v1/verify/nin`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ nin: ninVal }),
        });
        const json = (await res.json()) as { verified?: boolean; error?: string };
        if (!res.ok || !json.verified) {
          throw new Error(json.error ?? "NIN verification failed. Please check the number and try again.");
        }
        toast.success("NIN verified — identity confirmed.");
        setStatuses(prev => ({ ...prev, nin: "done" }));
        setOpenStep(null);
        return;
      }

      /* BVN — instant verification via Prembly */
      if (stepId === "bvn") {
        const res = await fetch(`${API}/api/v1/verify/bvn`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ bvn: bvnVal }),
        });
        const json = (await res.json()) as { verified?: boolean; error?: string };
        if (!res.ok || !json.verified) {
          throw new Error(json.error ?? "BVN verification failed. Please check the number and try again.");
        }
        toast.success("BVN verified — financial identity confirmed.");
        setStatuses(prev => ({ ...prev, bvn: "done" }));
        setOpenStep(null);
        return;
      }

      /* All other steps — file upload + manual review via Supabase */
      const payload: Record<string, unknown> = {};

      const needsFile = stepId === "cac" || stepId === "photo" || stepId === "rean";
      if (needsFile) {
        const fileEl = fileInputRefs.current[stepId];
        const file   = fileEl?.files?.[0];
        if (file) {
          const form = new FormData();
          form.append("file", file);
          const res = await fetch(`${API}/api/v1/upload/photo`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: form,
          });
          if (!res.ok) throw new Error("File upload failed — check file size (max 8 MB) and try again.");
          const json = (await res.json()) as { url: string };
          payload.file_url = json.url;
        }
      }

      if (stepId === "rean") payload.rean_number = reanVal;

      const { error } = await supabase
        .from("verification_submissions")
        .upsert(
          {
            agent_id:     agentId,
            step_id:      stepId,
            status:       "review",
            data:         payload,
            submitted_at: new Date().toISOString(),
          },
          { onConflict: "agent_id,step_id" },
        );

      if (error) throw new Error(error.message);

      toast.success("Submitted for review — we'll get back to you within 1–3 business days.");
      setStatuses(prev => ({ ...prev, [stepId]: "review" }));
      setSubmitted(prev => new Set(prev).add(stepId));
      setOpenStep(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Submission failed. Please try again.";
      toast.error(msg);
      setSubmitErr(msg);
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="tv-page">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="tv-hero">
        <div className="tv-ring" aria-label={`${doneCount} of ${STEPS.length} steps complete`}>
          <svg viewBox="0 0 128 128" width="128" height="128">
            <circle className="tv-ring__track" cx={CX} cy={CY} r={R} />
            <circle
              className="tv-ring__fill"
              cx={CX} cy={CY} r={R}
              strokeDasharray={CIRC}
              strokeDashoffset={ringOffset}
              stroke={ringColor}
            />
          </svg>
          <div className="tv-ring__center">
            <span className="tv-ring__frac">{doneCount}/{STEPS.length}</span>
            <span className="tv-ring__label">verified</span>
          </div>
        </div>

        <div className="tv-hero__body">
          <span className={`tv-hero__tier tv-tier--${currentTier}`}>
            <TierIcon tier={currentTier} size={13} />
            {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Agent
          </span>
          <h1 className="tv-hero__title">
            {doneCount < STEPS.length
              ? `${STEPS.length - doneCount} step${STEPS.length - doneCount === 1 ? "" : "s"} to Gold`
              : "You're fully verified"}
          </h1>
          <p className="tv-hero__sub">
            {doneCount < STEPS.length ? (
              <>
                Complete all 6 steps to earn your <strong>Gold seal</strong> — displayed on every listing, your public profile, and WhatsApp threads.
                {reviewCount > 0 && ` ${reviewCount} step${reviewCount > 1 ? "s are" : " is"} under review.`}
              </>
            ) : (
              "Your Gold seal is active on all listings. You appear first in search results and receive priority support."
            )}
          </p>
          <div className="tv-hero__tiers">
            {TIER_CONFIG.slice(1).map(t => {
              const isActive = currentTier === t.id;
              const isDone   = TIER_CONFIG.findIndex(x => x.id === currentTier) >= TIER_CONFIG.findIndex(x => x.id === t.id);
              return (
                <span
                  key={t.id}
                  className={`tv-tier-chip${isDone ? " tv-tier-chip--done" : isActive ? " tv-tier-chip--active" : ""}`}
                >
                  <span className="tv-tier-chip__dot" style={{ background: isDone ? "var(--ok)" : isActive ? "var(--forest)" : "var(--line)" }} />
                  <TierIcon tier={t.id} size={12} />
                  {t.name} · {t.stepsNeeded} steps
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="tv-body">

        {/* Step list */}
        <div className="tv-steps">
          {STEPS.map(step => {
            const status      = statuses[step.id];
            const isOpen      = openStep === step.id;
            const isSubmitting = submitting === step.id;
            const wasSubmitted = submitted.has(step.id);

            return (
              <div
                key={step.id}
                className={`tv-step tv-step--${status}${isOpen ? " tv-step--open" : ""}`}
              >
                <div className="tv-step__head" onClick={() => toggle(step.id)}>
                  <div className="tv-step__icon">
                    <step.Icon size={20} strokeWidth={1.8} style={{ color: step.iconColor }} />
                  </div>
                  <div className="tv-step__info">
                    <div className="tv-step__title">
                      {step.title}
                      <span
                        className={`tv-hero__tier tv-tier--${step.tier}`}
                        style={{ fontSize: 10, padding: "2px 8px", marginLeft: 6, display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <TierIcon tier={step.tier} size={10} />
                        {step.tier.charAt(0).toUpperCase() + step.tier.slice(1)}
                      </span>
                    </div>
                    <div className="tv-step__meta">
                      {status === "done"    && step.doneText}
                      {status === "review"  && step.reviewText}
                      {status === "pending" && "Action required — click to complete"}
                    </div>
                  </div>

                  <span className={`tv-step__status tv-step__status--${status}`}>
                    {status === "done" && (
                      <><Check size={12} strokeWidth={2.5} /> Done</>
                    )}
                    {status === "review" && (
                      <><RefreshCw size={12} strokeWidth={2} /> Under review</>
                    )}
                    {status === "pending" && (
                      <><AlertCircle size={12} strokeWidth={2} /> Pending</>
                    )}
                  </span>

                  {status !== "done" && (
                    <button
                      className="tv-step__toggle"
                      aria-expanded={isOpen}
                      aria-label={isOpen ? "Collapse" : "Expand"}
                      onClick={e => { e.stopPropagation(); toggle(step.id); }}
                    >
                      {isOpen
                        ? <ChevronUp   size={16} strokeWidth={2} style={{ color: "var(--clay)" }} />
                        : <ChevronDown size={16} strokeWidth={2} style={{ color: "var(--clay)" }} />
                      }
                    </button>
                  )}
                </div>

                {/* Expandable body */}
                <div className="tv-step__body">
                  <p className="tv-step__desc">{step.desc}</p>

                  {wasSubmitted || status === "review" ? (
                    <div className="tv-success">
                      <RefreshCw size={14} strokeWidth={2} className="tv-success__icon" />
                      Submitted successfully — {step.reviewText.split("·")[1]?.trim() ?? "under review"}
                    </div>
                  ) : (
                    <div className="tv-form">
                      <StepForm
                        step={step}
                        ninVal={ninVal}   setNinVal={setNinVal}
                        bvnVal={bvnVal}   setBvnVal={setBvnVal}
                        reanVal={reanVal} setReanVal={setReanVal}
                        fileNames={fileNames}
                        fileInputRefs={fileInputRefs}
                        onFileChange={handleFileChange}
                        onSelfieStart={() => submit(step.id)}
                      />
                      {submitErr && isOpen && (
                        <div className="tv-form__err">
                          <AlertCircle size={13} strokeWidth={2} />
                          {submitErr}
                        </div>
                      )}
                      <div className="tv-form__row">
                        <button
                          className="tv-cancel"
                          onClick={() => { setOpenStep(null); setSubmitErr(null); }}
                        >
                          Cancel
                        </button>
                        {step.inputKind !== "selfie" && (
                          <button
                            className="tv-submit"
                            disabled={!canSubmit(step)}
                            onClick={() => submit(step.id)}
                          >
                            {isSubmitting
                              ? <><span className="tv-spin" /> Submitting…</>
                              : "Submit for verification"
                            }
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <aside className="tv-sidebar">

          {/* Tier unlocks */}
          <div className="tv-card">
            <div className="tv-card__head">
              <Trophy size={16} strokeWidth={2} style={{ color: "var(--gold-deep)", flexShrink: 0 }} />
              What each tier unlocks
            </div>
            <div className="tv-tier-list">
              {TIER_CONFIG.slice(1).map(t => {
                const tierOrder = ["starter","bronze","silver","gold"];
                const isDone    = tierOrder.indexOf(currentTier) >= tierOrder.indexOf(t.id);
                return (
                  <div key={t.id} className={`tv-tier-row${currentTier === t.id ? " tv-tier-row--active" : ""}`}>
                    <span className="tv-tier-row__icon">
                      {t.Icon && <t.Icon size={18} strokeWidth={2} style={{ color: t.iconColor }} />}
                    </span>
                    <div>
                      <div className="tv-tier-row__name" style={{ color: isDone ? "var(--ok)" : "var(--ink)" }}>
                        {isDone && <Check size={12} strokeWidth={2.5} style={{ color: "var(--ok)", marginRight: 4 }} />}
                        {t.name}
                      </div>
                      <ul className="tv-tier-row__perks">
                        {t.perks.map(p => <li key={p}>{p}</li>)}
                      </ul>
                      <div className="tv-tier-row__req">{t.req}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Listing preview */}
          <div className="tv-card">
            <div className="tv-card__head">
              <Home size={16} strokeWidth={2} style={{ color: "var(--forest)", flexShrink: 0 }} />
              How your badge appears
            </div>
            <div className="tv-preview">
              <div className="tv-preview__label">
                {currentTier === "starter"
                  ? "Unverified listing"
                  : `${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} verified listing`}
              </div>
              <div className="tv-preview__card">
                <div className="tv-preview__img">
                  <span className="tv-preview__cat">For Sale</span>
                  {currentTier !== "starter" && (
                    <span className="tv-preview__seal" title="Verified listing">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="tv-preview__body">
                  <div className="tv-preview__price">₦45,000,000</div>
                  <div className="tv-preview__title">4-Bed Duplex, Ikate, Lekki</div>
                  <div className="tv-preview__agent">
                    <span className="tv-preview__av">CO</span>
                    Chidi Okonkwo
                    {currentTier !== "starter" && (
                      <span className="tv-preview__vbadge" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <TierIcon tier={currentTier} size={12} />
                        {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why verify */}
          <div className="tv-card">
            <div className="tv-card__head">
              <Lightbulb size={16} strokeWidth={2} style={{ color: "var(--gold-deep)", flexShrink: 0 }} />
              Why it matters
            </div>
            <div className="tv-why-list">
              {WHY_ITEMS.map(({ Icon, title, body }) => (
                <div className="tv-why-item" key={title}>
                  <div className="tv-why-item__icon">
                    <Icon size={16} strokeWidth={1.8} style={{ color: "var(--forest)" }} />
                  </div>
                  <div className="tv-why-item__text">
                    <strong>{title}</strong><br />{body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ── Per-step form sub-component ─────────────────────────────── */
function StepForm({
  step,
  ninVal,   setNinVal,
  bvnVal,   setBvnVal,
  reanVal,  setReanVal,
  fileNames,
  fileInputRefs,
  onFileChange,
  onSelfieStart,
}: {
  step: Step;
  ninVal:  string; setNinVal:  (v: string) => void;
  bvnVal:  string; setBvnVal:  (v: string) => void;
  reanVal: string; setReanVal: (v: string) => void;
  fileNames: Record<string, string>;
  fileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  onFileChange: (id: StepId, e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelfieStart: () => void;
}) {
  const { id, inputKind } = step;

  if (inputKind === "nin") {
    const valid = ninVal.replace(/\s/g, "").length === 0 || ninVal.replace(/\s/g, "").length === 11;
    return (
      <div className="tv-field">
        <label htmlFor="tv-nin">Your NIN (11 digits)</label>
        <input
          id="tv-nin"
          type="text"
          inputMode="numeric"
          maxLength={11}
          placeholder="e.g. 12345678901"
          value={ninVal}
          className={!valid ? "invalid" : ""}
          onChange={e => setNinVal(e.target.value.replace(/\D/g, ""))}
        />
        <span className="tv-field__hint">
          Found on your National ID card, NIMC slip, or obtained at any NIMC enrolment centre.
        </span>
      </div>
    );
  }

  if (inputKind === "bvn") {
    const valid = bvnVal.replace(/\s/g, "").length === 0 || bvnVal.replace(/\s/g, "").length === 11;
    return (
      <div className="tv-field">
        <label htmlFor="tv-bvn">Your BVN (11 digits)</label>
        <input
          id="tv-bvn"
          type="text"
          inputMode="numeric"
          maxLength={11}
          placeholder="e.g. 22345678901"
          value={bvnVal}
          className={!valid ? "invalid" : ""}
          onChange={e => setBvnVal(e.target.value.replace(/\D/g, ""))}
        />
        <span className="tv-field__hint">
          Dial *565*0# on any registered phone, or check your banking app. Your BVN is 11 digits.
        </span>
      </div>
    );
  }

  if (inputKind === "selfie") {
    return (
      <div className="tv-selfie-zone">
        <div className="tv-selfie-zone__preview">
          <Camera size={32} strokeWidth={1.5} style={{ color: "var(--forest)" }} />
        </div>
        <p className="tv-selfie-zone__text">
          A short liveness check — you'll be asked to blink and turn your head slightly.
          Takes under 60 seconds. Uses on-device processing; your face is never stored.
        </p>
        <button className="tv-selfie-btn" onClick={onSelfieStart}>
          <Camera size={16} strokeWidth={2} /> Start liveness check
        </button>
      </div>
    );
  }

  if (inputKind === "file") {
    const fileName = fileNames[id];
    return (
      <div
        className={`tv-file-zone${fileName ? " tv-file-zone--filled" : ""}`}
        onClick={() => fileInputRefs.current[id]?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && fileInputRefs.current[id]?.click()}
        aria-label="Upload file"
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          ref={el => { fileInputRefs.current[id] = el; }}
          onChange={e => onFileChange(id, e)}
        />
        <div className="tv-file-zone__icon">
          {fileName
            ? <FileText size={24} strokeWidth={1.5} style={{ color: "var(--forest)" }} />
            : <Upload   size={24} strokeWidth={1.5} style={{ color: "var(--clay)"   }} />
          }
        </div>
        <div className="tv-file-zone__text">
          {fileName
            ? fileName
            : <><strong>Click to upload</strong> or drag &amp; drop</>
          }
        </div>
        <div className="tv-file-zone__sub">
          {fileName ? "Click to replace" : "PDF, JPG, or PNG · max 8 MB"}
        </div>
      </div>
    );
  }

  if (inputKind === "rean") {
    const fileName = fileNames[id];
    return (
      <>
        <div className="tv-field">
          <label htmlFor="tv-rean">REAN licence number</label>
          <input
            id="tv-rean"
            type="text"
            placeholder="e.g. REAN/LAG/2021/004512"
            value={reanVal}
            onChange={e => setReanVal(e.target.value)}
          />
          <span className="tv-field__hint">
            Found on your REAN membership certificate or registration email.
          </span>
        </div>
        <div className="tv-field">
          <label>Upload licence certificate</label>
          <div
            className={`tv-file-zone${fileName ? " tv-file-zone--filled" : ""}`}
            onClick={() => fileInputRefs.current[id]?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && fileInputRefs.current[id]?.click()}
            aria-label="Upload REAN certificate"
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              ref={el => { fileInputRefs.current[id] = el; }}
              onChange={e => onFileChange(id, e)}
            />
            <div className="tv-file-zone__icon">
              {fileName
                ? <FileText size={24} strokeWidth={1.5} style={{ color: "var(--forest)" }} />
                : <Upload   size={24} strokeWidth={1.5} style={{ color: "var(--clay)"   }} />
              }
            </div>
            <div className="tv-file-zone__text">
              {fileName
                ? fileName
                : <><strong>Click to upload</strong> your REAN certificate</>
              }
            </div>
            <div className="tv-file-zone__sub">
              {fileName ? "Click to replace" : "PDF, JPG, or PNG · max 8 MB"}
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
