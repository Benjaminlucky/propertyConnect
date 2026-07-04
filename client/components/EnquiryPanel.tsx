"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  CalendarCheck,
  Mail,
  Phone,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { saveLead } from "@/lib/enquiries";
import { api } from "@/lib/api";
import type { Listing } from "@/lib/listings";

interface Props {
  listing: Listing;
  agentPhone: string;
}

type Mode = "whatsapp" | "viewing" | "message";

interface ViewDate {
  date: Date;
  dayLabel: string;
  numLabel: string;
  monthLabel: string;
  iso: string;
}

const TIME_SLOTS = [
  { label: "9:00 AM",  sub: "Morning" },
  { label: "11:00 AM", sub: "Mid-morning" },
  { label: "2:00 PM",  sub: "Afternoon" },
  { label: "4:00 PM",  sub: "Late afternoon" },
  { label: "6:00 PM",  sub: "Evening" },
  { label: "Flexible", sub: "Any time" },
];

const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getNext5Weekdays(): ViewDate[] {
  const days: ViewDate[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);
  while (days.length < 5) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push({
        date: new Date(cursor),
        dayLabel: DAY_NAMES[dow],
        numLabel: String(cursor.getDate()),
        monthLabel: MONTH_NAMES[cursor.getMonth()],
        iso: cursor.toISOString().split("T")[0],
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function waPhone(phone: string): string {
  return phone.replace(/^0/, "234").replace(/\D/g, "");
}

// Seed listing IDs are 7-digit numbers (3531456+); DB IDs auto-increment from 1
const isDbListing = (id: number) => id < 1_000_000;

async function postEnquiry(payload: {
  listing_id: number;
  mode: Mode;
  name: string;
  phone?: string;
  email?: string;
  message?: string;
}): Promise<void> {
  await api.post("/api/v1/enquiries", payload);
}

export function EnquiryPanel({ listing: l, agentPhone }: Props) {
  const [mode, setMode] = useState<Mode>("viewing");
  const [sent, setSent] = useState(false);
  const [sentMode, setSentMode] = useState<Mode>("viewing");
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  /* WhatsApp state */
  const agentFirst = l.agent.split(" ")[0];
  const defaultWaMsg =
    `Hi ${agentFirst}, I'm interested in your listing:\n${l.title} in ${l.neighbourhood}, ${l.state} at ${l.price}.\n\nIs it still available?`;
  const [waMsg, setWaMsg] = useState(defaultWaMsg);

  /* Viewing state */
  const [dates, setDates] = useState<ViewDate[]>([]);
  const [selDate, setSelDate] = useState<string>("");
  const [selTime, setSelTime] = useState<string>("");

  /* Shared sender fields */
  const [senderName, setSenderName]   = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [msgBody, setMsgBody]         = useState("");

  useEffect(() => {
    setDates(getNext5Weekdays());
  }, []);

  async function handleWaSend() {
    window.open(`https://wa.me/${waPhone(agentPhone)}?text=${encodeURIComponent(waMsg)}`, "_blank");
    if (isDbListing(l.id)) {
      try {
        await postEnquiry({
          listing_id: l.id,
          mode: "whatsapp",
          name: "WhatsApp visitor",
          message: waMsg.slice(0, 500),
        });
      } catch {
        // non-blocking — WA window already opened
      }
    } else {
      saveLead({
        listingId: l.id, listingTitle: l.title, listingPrice: l.price,
        listingCategory: l.category, neighbourhood: l.neighbourhood, state: l.state,
        agentName: l.agent, type: "whatsapp", senderName: "WhatsApp visitor",
        message: waMsg,
      });
    }
    toast.success("WhatsApp message opened — check for a reply from the agent!");
    setSentMode("whatsapp");
    setSent(true);
  }

  async function handleViewingSubmit() {
    if (!selDate || !selTime || !senderName.trim()) return;
    setSubmitting(true);
    setSubmitErr(null);
    try {
      if (isDbListing(l.id)) {
        await postEnquiry({
          listing_id: l.id,
          mode: "viewing",
          name: senderName.trim(),
          phone: senderPhone.trim() || undefined,
          email: senderEmail.trim() || undefined,
          message: `Viewing request: ${selDate} at ${selTime}`,
        });
      } else {
        saveLead({
          listingId: l.id, listingTitle: l.title, listingPrice: l.price,
          listingCategory: l.category, neighbourhood: l.neighbourhood, state: l.state,
          agentName: l.agent, type: "viewing",
          senderName: senderName.trim(),
          senderPhone: senderPhone.trim() || undefined,
          senderEmail: senderEmail.trim() || undefined,
          viewingDate: selDate, viewingTime: selTime,
        });
      }
      toast.success("Viewing request sent! The agent will confirm your appointment.");
      setSentMode("viewing");
      setSent(true);
    } catch {
      toast.error("Could not send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMsgSubmit() {
    if (!senderName.trim() || !msgBody.trim()) return;
    setSubmitting(true);
    setSubmitErr(null);
    try {
      if (isDbListing(l.id)) {
        await postEnquiry({
          listing_id: l.id,
          mode: "message",
          name: senderName.trim(),
          phone: senderPhone.trim() || undefined,
          email: senderEmail.trim() || undefined,
          message: msgBody.trim().slice(0, 500),
        });
      } else {
        saveLead({
          listingId: l.id, listingTitle: l.title, listingPrice: l.price,
          listingCategory: l.category, neighbourhood: l.neighbourhood, state: l.state,
          agentName: l.agent, type: "message",
          senderName: senderName.trim(),
          senderPhone: senderPhone.trim() || undefined,
          senderEmail: senderEmail.trim() || undefined,
          message: msgBody.trim(),
        });
      }
      toast.success("Message sent! The agent will get back to you shortly.");
      setSentMode("message");
      setSent(true);
    } catch {
      toast.error("Could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSent(false);
    setSubmitErr(null);
    setSenderName("");
    setSenderPhone("");
    setSenderEmail("");
    setMsgBody("");
    setSelDate("");
    setSelTime("");
    setWaMsg(defaultWaMsg);
  }

  /* ── Success state ─────────────────────────────────────── */
  if (sent) {
    const sentLabels: Record<Mode, string> = {
      whatsapp: "Message sent via WhatsApp",
      viewing: "Viewing request sent",
      message: "Message sent",
    };
    const sentSubs: Record<Mode, string> = {
      whatsapp: `${agentFirst} will see your message. The agent's number is now revealed below.`,
      viewing:  `${agentFirst} will confirm your viewing slot. Number revealed below.`,
      message:  `${agentFirst} will reply shortly. The agent's number is now revealed below.`,
    };
    return (
      <div className="eq-panel">
        <div className="eq-sent">
          <div className="eq-sent-icon">
            <CheckCircle2 size={26} strokeWidth={2} />
          </div>
          <div className="eq-sent-title">{sentLabels[sentMode]}</div>
          <p className="eq-sent-sub">{sentSubs[sentMode]}</p>

          <div className="eq-phone-reveal">
            <div className="eq-phone-reveal-icon">
              <Phone size={16} strokeWidth={2} />
            </div>
            <div>
              <div className="eq-phone-reveal-label">Agent direct line</div>
              <div className="eq-phone-reveal-num">{agentPhone}</div>
            </div>
          </div>

          <button className="eq-another" onClick={resetForm}>
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  /* ── Phone gate widget ─────────────────────────────────── */
  const PhoneGate = () => (
    <div className="eq-phone-gate">
      <div className="eq-phone-gate-icon">
        <Lock size={14} strokeWidth={2} />
      </div>
      <div className="eq-phone-gate-text">
        <strong>Phone number hidden</strong>
        Submit an enquiry to reveal the agent&apos;s direct line
      </div>
    </div>
  );

  /* ── Main panel ─────────────────────────────────────────── */
  return (
    <div className="eq-panel">
      {/* Tabs */}
      <div className="eq-tabs">
        <button
          className={`eq-tab wa-tab${mode === "whatsapp" ? " active" : ""}`}
          onClick={() => setMode("whatsapp")}
        >
          <div className="eq-tab-icon">
            <MessageCircle size={14} strokeWidth={2} color={mode === "whatsapp" ? "#128c7e" : "var(--clay)"} />
          </div>
          WhatsApp
        </button>
        <button
          className={`eq-tab${mode === "viewing" ? " active" : ""}`}
          onClick={() => setMode("viewing")}
        >
          <div className="eq-tab-icon">
            <CalendarCheck size={14} strokeWidth={2} color={mode === "viewing" ? "var(--forest)" : "var(--clay)"} />
          </div>
          View
        </button>
        <button
          className={`eq-tab${mode === "message" ? " active" : ""}`}
          onClick={() => setMode("message")}
        >
          <div className="eq-tab-icon">
            <Mail size={14} strokeWidth={2} color={mode === "message" ? "var(--forest)" : "var(--clay)"} />
          </div>
          Message
        </button>
      </div>

      {/* ── WhatsApp mode ── */}
      {mode === "whatsapp" && (
        <div className="eq-body">
          <div className="eq-wa-preview">
            <div className="eq-wa-label">Preview message</div>
            <div className="eq-wa-text">{waMsg}</div>
            <div className="eq-wa-time">
              {new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          <div className="eq-field">
            <label className="eq-label">
              Edit message <span className="eq-optional">(optional)</span>
            </label>
            <textarea
              className="eq-wa-edit"
              value={waMsg}
              onChange={(e) => setWaMsg(e.target.value)}
              rows={4}
            />
          </div>

          <button className="eq-btn eq-btn-wa" onClick={handleWaSend}>
            <MessageCircle size={16} strokeWidth={2} />
            Open WhatsApp · {agentFirst}
          </button>
          <PhoneGate />
        </div>
      )}

      {/* ── Viewing mode ── */}
      {mode === "viewing" && (
        <div className="eq-body">
          <div className="eq-section-label">Pick a date</div>
          <div className="eq-dates">
            {dates.map((d) => (
              <button
                key={d.iso}
                className={`eq-date-chip${selDate === d.iso ? " active" : ""}`}
                onClick={() => setSelDate(d.iso)}
              >
                <div className="eq-date-day">{d.dayLabel}</div>
                <div className="eq-date-num">{d.numLabel}</div>
                <div className="eq-date-month">{d.monthLabel}</div>
              </button>
            ))}
          </div>

          <div className="eq-section-label">Preferred time</div>
          <div className="eq-times">
            {TIME_SLOTS.map((t) => (
              <button
                key={t.label}
                className={`eq-time-btn${selTime === t.label ? " active" : ""}`}
                onClick={() => setSelTime(t.label)}
              >
                {t.label}
                <div className="eq-time-sub">{t.sub}</div>
              </button>
            ))}
          </div>

          <div className="eq-field">
            <label className="eq-label">Your name</label>
            <input
              className="eq-input"
              placeholder="e.g. Ade Olatunji"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
          <div className="eq-grid-2">
            <div className="eq-field">
              <label className="eq-label">
                Phone <span className="eq-optional">(optional)</span>
              </label>
              <input
                className="eq-input"
                placeholder="080 ··· ···"
                type="tel"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
              />
            </div>
            <div className="eq-field">
              <label className="eq-label">
                Email <span className="eq-optional">(optional)</span>
              </label>
              <input
                className="eq-input"
                placeholder="your@email.com"
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>
          </div>

          {submitErr && <p className="lw-publish-err">{submitErr}</p>}

          <button
            className="eq-btn eq-btn-forest"
            onClick={handleViewingSubmit}
            disabled={!selDate || !selTime || !senderName.trim() || submitting}
          >
            <CalendarCheck size={16} strokeWidth={2} />
            {submitting ? "Sending…" : "Request Viewing"}
          </button>
          <PhoneGate />
        </div>
      )}

      {/* ── Message mode ── */}
      {mode === "message" && (
        <div className="eq-body">
          <div className="eq-field">
            <label className="eq-label">Your name</label>
            <input
              className="eq-input"
              placeholder="e.g. Ade Olatunji"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>
          <div className="eq-grid-2">
            <div className="eq-field">
              <label className="eq-label">
                Phone <span className="eq-optional">(optional)</span>
              </label>
              <input
                className="eq-input"
                placeholder="080 ··· ···"
                type="tel"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
              />
            </div>
            <div className="eq-field">
              <label className="eq-label">
                Email <span className="eq-optional">(optional)</span>
              </label>
              <input
                className="eq-input"
                placeholder="your@email.com"
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="eq-field">
            <label className="eq-label">Message</label>
            <textarea
              className="eq-textarea"
              placeholder={`Hi ${agentFirst}, I'm interested in this listing…`}
              rows={4}
              value={msgBody}
              onChange={(e) => setMsgBody(e.target.value)}
            />
          </div>

          {submitErr && <p className="lw-publish-err">{submitErr}</p>}

          <button
            className="eq-btn eq-btn-forest"
            onClick={handleMsgSubmit}
            disabled={!senderName.trim() || !msgBody.trim() || submitting}
          >
            <Mail size={16} strokeWidth={2} />
            {submitting ? "Sending…" : "Send Message"}
          </button>
          <PhoneGate />
        </div>
      )}
    </div>
  );
}
