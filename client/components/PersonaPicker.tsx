"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Home, Building2, Calendar, Warehouse, ArrowRight, X } from "lucide-react";
import { LogoMark } from "@/components/ui/Icons";
import { Persona, PERSONA_META, getStoredUser, storeUser } from "@/lib/auth";

interface Props {
  marketSlug: string;
  next: string;
}

const PERSONA_ICONS: Record<Persona, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  agent:      Briefcase,
  landlord:   Home,
  developer:  Building2,
  shortlet:   Calendar,
  commercial: Warehouse,
};

const PERSONAS = Object.entries(PERSONA_META) as [Persona, (typeof PERSONA_META)[Persona]][];

export function PersonaPicker({ marketSlug, next }: Props) {
  const router = useRouter();
  const [persona, setPersona] = useState<Persona>("agent");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleContinue = async () => {
    setSaving(true);
    setErr("");
    const { supabase } = await import("@/lib/supabase-client");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/${marketSlug}/auth`);
      return;
    }

    const { error } = await supabase
      .from("agent_profiles")
      .update({ persona, persona_confirmed: true })
      .eq("id", user.id);

    if (error) {
      setErr("Couldn't save your selection. Please try again.");
      setSaving(false);
      return;
    }

    // Keep Supabase user_metadata in sync — mirrors handleSaveSettings in DashboardView.
    await supabase.auth.updateUser({ data: { persona } });

    const stored = getStoredUser();
    if (stored) storeUser({ ...stored, persona });

    router.push(next);
  };

  return (
    <div className="au-root">
      <div className="au-panel">
        <div className="au-form-wrap">
          <div className="au-logo">
            <LogoMark size={30} />
            <span className="au-logo-name">MyPropertyConnect</span>
          </div>

          <div className="au-eyebrow">One more thing</div>
          <h1 className="au-title">Who are you?</h1>
          <p className="au-sub">We tailor your dashboard, alerts, and listing fields to your persona.</p>

          <div className="au-persona-grid">
            {PERSONAS.map(([key, meta]) => {
              const Icon = PERSONA_ICONS[key];
              return (
                <div
                  key={key}
                  className={`au-persona-card${persona === key ? " selected" : ""}`}
                  onClick={() => setPersona(key)}
                >
                  <div className="au-pc-icon">
                    <Icon size={16} strokeWidth={1.8} />
                  </div>
                  <div className="au-pc-label">{meta.label}</div>
                  <div className="au-pc-blurb">{meta.blurb}</div>
                </div>
              );
            })}
          </div>

          {err && (
            <div className="au-error" style={{ marginBottom: 12 }}>
              <X size={12} strokeWidth={2.5} /> {err}
            </div>
          )}

          <button
            className="au-btn au-btn-primary"
            onClick={handleContinue}
            disabled={saving}
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving…" : <>Continue as {PERSONA_META[persona].label} <ArrowRight size={16} strokeWidth={2} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
