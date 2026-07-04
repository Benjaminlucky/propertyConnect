"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Briefcase, Home, Building2, Calendar, Warehouse,
  Mail, Eye, EyeOff, ArrowRight, ShieldCheck, TrendingUp,
  Bell, Check, X,
} from "lucide-react";
import { GoogleMark, FacebookMark } from "@/components/ui/Icons";
import { LogoMark } from "@/components/ui/Icons";
import {
  Persona, PERSONA_META, AuthUser,
  signUpWithSupabase, signInWithSupabase,
} from "@/lib/auth";

type Flow = "choose" | "signup-persona" | "signup-details" | "signup-email-preview" | "verify" | "signin";

interface Props {
  onSuccess: (user: AuthUser) => void;
  marketSlug: string;
}

const PERSONA_ICONS: Record<Persona, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  agent:      Briefcase,
  landlord:   Home,
  developer:  Building2,
  shortlet:   Calendar,
  commercial: Warehouse,
};

const PERSONAS = Object.entries(PERSONA_META) as [Persona, (typeof PERSONA_META)[Persona]][];

const SIDE_CARDS = [
  { icon: ShieldCheck, title: "4,210 verified listings",    sub: "Every property screened before going live" },
  { icon: TrendingUp,  title: "98% lead open rate",         sub: "Agents say our alerts are the most useful" },
  { icon: Bell,        title: "Instant WhatsApp + email",   sub: "Never miss a buyer or renter enquiry" },
];

export function AuthFlow({ onSuccess, marketSlug }: Props) {
  const [flow, setFlow] = useState<Flow>("choose");
  const [persona, setPersona] = useState<Persona>("agent");
  const [showPass, setShowPass] = useState(false);
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Signup form
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass]   = useState("");
  const [emailOpt, setEmailOpt] = useState(true);
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);

  // Signin form
  const [siEmail, setSiEmail] = useState("");
  const [siPass, setSiPass]   = useState("");
  const [siErr, setSiErr]     = useState("");
  const [siLoading, setSiLoading] = useState(false);

  // OAuth (Google / Facebook)
  const [oauthErr, setOauthErr] = useState("");
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null);

  const handleOAuth = async (provider: "google" | "facebook") => {
    setOauthErr("");
    setOauthLoading(provider);
    const { supabase } = await import("@/lib/supabase-client");
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/auth/callback?next=/${marketSlug}/dashboard` },
    });
    if (error) {
      setOauthErr(error.message);
      setOauthLoading(null);
    }
    // On success the browser navigates away to the provider — no further action needed.
  };

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !pass.trim()) {
      setErr("Please fill all required fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErr("Enter a valid email address.");
      return;
    }
    if (pass.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    setErr("");
    setLoading(true);
    const { error } = await signUpWithSupabase({
      name: name.trim(), email: email.trim(), phone, password: pass, persona,
    });
    setLoading(false);
    if (error) { setErr(error); return; }
    if (emailOpt) setFlow("signup-email-preview");
    else setFlow("verify");
  };

  const handleSignIn = async () => {
    setSiErr("");
    setSiLoading(true);
    const { user, error } = await signInWithSupabase(siEmail.trim(), siPass);
    setSiLoading(false);
    if (error || !user) {
      setSiErr(error ?? "Sign-in failed. Check your email and password.");
      return;
    }
    onSuccess(user);
  };

  const handleCodeInput = useCallback((idx: number, val: string) => {
    if (val.length > 1) return;
    const next = [...code];
    next[idx] = val;
    setCode(next);
    if (val && idx < 5) codeRefs.current[idx + 1]?.focus();
  }, [code]);

  // Verify step: after signUp, user must click the email link then come back to sign in
  const handleVerify = async () => {
    // Try signing in — will succeed once email is confirmed
    setSiLoading(true);
    const { user, error } = await signInWithSupabase(email.trim(), pass);
    setSiLoading(false);
    if (user) { onSuccess(user); return; }
    setErr(error ?? "Email not verified yet. Check your inbox and click the link.");
  };

  const stepDots = (current: number, total: number) => (
    <div className="au-step-dots">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`au-dot${i === current ? " active" : ""}`} />
      ))}
    </div>
  );

  return (
    <div className="au-root">
      {/* LEFT PANEL */}
      <div className="au-panel">
        <div className="au-form-wrap">
          <Link href={`/${marketSlug}`} className="au-logo">
            <LogoMark size={30} />
            <span className="au-logo-name">PropertyConnect</span>
          </Link>

          {/* ── CHOOSE ── */}
          {flow === "choose" && (
            <>
              <div className="au-eyebrow">Get started</div>
              <h1 className="au-title">List your property free.</h1>
              <p className="au-sub">
                Join 980 verified agents and landlords across Nigeria. Your first listing is free, forever.
              </p>
              <button className="au-btn au-btn-primary" onClick={() => setFlow("signup-persona")}>
                Create a free account <ArrowRight size={16} strokeWidth={2} />
              </button>
              <button className="au-btn au-btn-secondary" onClick={() => setFlow("signin")}>
                Sign in to an existing account
              </button>
              <div className="au-divider"><span /><p>or continue with</p><span /></div>
              {oauthErr && (
                <div className="au-error" style={{ marginBottom: 12 }}>
                  <X size={12} strokeWidth={2.5} /> {oauthErr}
                </div>
              )}
              <div className="au-oauth-row">
                <button
                  type="button"
                  className="au-oauth-btn"
                  onClick={() => handleOAuth("google")}
                  disabled={oauthLoading !== null}
                >
                  <GoogleMark size={18} /> {oauthLoading === "google" ? "Redirecting…" : "Google"}
                </button>
                <button
                  type="button"
                  className="au-oauth-btn"
                  onClick={() => handleOAuth("facebook")}
                  disabled={oauthLoading !== null}
                >
                  <FacebookMark size={18} /> {oauthLoading === "facebook" ? "Redirecting…" : "Facebook"}
                </button>
              </div>
              <div className="au-divider"><span /><p>Your data is encrypted and never sold</p><span /></div>
            </>
          )}

          {/* ── SIGNUP — PERSONA ── */}
          {flow === "signup-persona" && (
            <>
              {stepDots(0, 3)}
              <div className="au-eyebrow">Step 1 of 3</div>
              <h1 className="au-title">Who are you listing as?</h1>
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
              <button className="au-btn au-btn-primary" onClick={() => setFlow("signup-details")}>
                Continue as {PERSONA_META[persona].label} <ArrowRight size={16} strokeWidth={2} />
              </button>
              <div className="au-toggle">
                Already have an account?{" "}
                <button onClick={() => setFlow("signin")}>Sign in</button>
              </div>
            </>
          )}

          {/* ── SIGNUP — DETAILS ── */}
          {flow === "signup-details" && (
            <>
              {stepDots(1, 3)}
              <div className="au-eyebrow">Step 2 of 3</div>
              <h1 className="au-title">Create your account</h1>
              <p className="au-sub">
                Signing up as <strong>{PERSONA_META[persona].label}</strong>.{" "}
                <button
                  style={{ background: "none", border: "none", color: "var(--forest)", cursor: "pointer", fontWeight: 600, fontSize: "inherit", fontFamily: "inherit", padding: 0 }}
                  onClick={() => setFlow("signup-persona")}
                >
                  Change
                </button>
              </p>

              <div className="au-field">
                <label className="au-label">Full name</label>
                <input className="au-input" type="text" placeholder="e.g. Chidi Okonkwo" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="au-field">
                <label className="au-label">Email address</label>
                <input className="au-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="au-field">
                <label className="au-label">Phone number <span style={{ color: "var(--clay)", fontWeight: 400 }}>(optional)</span></label>
                <input className="au-input" type="tel" placeholder="+234 …" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="au-field">
                <label className="au-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="au-input"
                    type={showPass ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--clay)", display: "flex" }}
                  >
                    {showPass ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                  </button>
                </div>
              </div>

              {err && (
                <div className="au-error">
                  <X size={12} strokeWidth={2.5} /> {err}
                </div>
              )}

              <label className="au-consent" style={{ marginTop: 12 }} onClick={() => setEmailOpt(!emailOpt)}>
                <div className="au-consent-box">
                  {emailOpt && <Check size={10} strokeWidth={3} color="var(--forest)" />}
                </div>
                <span className="au-consent-text">
                  Send me lead alerts, performance reports, and market insights for {PERSONA_META[persona].label.toLowerCase()}s. You can adjust any time.
                </span>
              </label>

              <button
                className="au-btn au-btn-primary"
                onClick={handleSignUp}
                disabled={loading}
                style={{ marginTop: 4, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Creating account…" : <><span>Create account</span> <ArrowRight size={16} strokeWidth={2} /></>}
              </button>
            </>
          )}

          {/* ── SIGNUP — EMAIL PREVIEW ── */}
          {flow === "signup-email-preview" && (
            <>
              {stepDots(2, 3)}
              <div className="au-eyebrow">Step 3 of 3</div>
              <h1 className="au-title">Here&apos;s what you&apos;ll receive</h1>
              <p className="au-sub">
                Your personalised email programme as a <strong>{PERSONA_META[persona].label}</strong>:
              </p>

              <div className="au-email-preview">
                <div className="au-email-preview-title">Your email programme</div>
                {PERSONA_META[persona].emailSequence.map((item, i) => (
                  <div key={i} className="au-email-row">
                    <div className="au-email-dot" />
                    <div>
                      <div className="au-email-timing">{item.timing}</div>
                      <div className="au-email-text">{item.subject}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="au-btn au-btn-primary" onClick={() => setFlow("verify")}>
                <Mail size={16} strokeWidth={2} /> Send verification email
              </button>
              <div className="au-toggle" style={{ marginTop: 12 }}>
                We will never spam you or sell your address.
              </div>
            </>
          )}

          {/* ── EMAIL VERIFY ── */}
          {flow === "verify" && (
            <>
              <div className="au-verify-icon">
                <Mail size={28} strokeWidth={1.5} />
              </div>
              <div className="au-eyebrow">Almost there</div>
              <h1 className="au-title">Confirm your email</h1>
              <p className="au-sub">
                We sent a confirmation link to <strong>{email || pendingUser?.email}</strong>.
                Open the email and click the link — it takes 10 seconds.
              </p>

              <div className="au-verify-steps">
                <div className="au-verify-step">
                  <span className="au-verify-num">1</span>
                  Open your inbox (check spam too)
                </div>
                <div className="au-verify-step">
                  <span className="au-verify-num">2</span>
                  Click the &ldquo;Confirm your email&rdquo; link
                </div>
                <div className="au-verify-step">
                  <span className="au-verify-num">3</span>
                  Come back here and tap the button below
                </div>
              </div>

              {err && (
                <div className="au-error">
                  <X size={12} strokeWidth={2.5} /> {err}
                </div>
              )}

              <button
                className="au-btn au-btn-primary"
                onClick={handleVerify}
                disabled={siLoading}
                style={{ opacity: siLoading ? 0.7 : 1 }}
              >
                {siLoading ? "Checking…" : <><Check size={16} strokeWidth={2} /> I&apos;ve confirmed my email</>}
              </button>

              <div className="au-resend">
                Wrong email?{" "}
                <button onClick={() => setFlow("signup-details")}>Go back</button>
              </div>
            </>
          )}

          {/* ── SIGN IN ── */}
          {flow === "signin" && (
            <>
              <div className="au-eyebrow">Welcome back</div>
              <h1 className="au-title">Sign in to your account</h1>
              <p className="au-sub">Continue managing your listings and leads.</p>

              <div className="au-field">
                <label className="au-label">Email address</label>
                <input className="au-input" type="email" placeholder="you@example.com" value={siEmail} onChange={e => setSiEmail(e.target.value)} />
              </div>
              <div className="au-field">
                <label className="au-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="au-input"
                    type={showPass ? "text" : "password"}
                    placeholder="Your password"
                    value={siPass}
                    onChange={e => setSiPass(e.target.value)}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--clay)", display: "flex" }}
                  >
                    {showPass ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                  </button>
                </div>
              </div>

              {siErr && (
                <div className="au-error" style={{ marginBottom: 12 }}>
                  <X size={12} strokeWidth={2.5} /> {siErr}
                </div>
              )}

              <button
                className="au-btn au-btn-primary"
                onClick={handleSignIn}
                disabled={siLoading}
                style={{ opacity: siLoading ? 0.7 : 1 }}
              >
                {siLoading ? "Signing in…" : <><span>Sign in</span> <ArrowRight size={16} strokeWidth={2} /></>}
              </button>

              <div className="au-divider"><span /><p>or continue with</p><span /></div>
              {oauthErr && (
                <div className="au-error" style={{ marginBottom: 12 }}>
                  <X size={12} strokeWidth={2.5} /> {oauthErr}
                </div>
              )}
              <div className="au-oauth-row">
                <button
                  type="button"
                  className="au-oauth-btn"
                  onClick={() => handleOAuth("google")}
                  disabled={oauthLoading !== null}
                >
                  <GoogleMark size={18} /> {oauthLoading === "google" ? "Redirecting…" : "Google"}
                </button>
                <button
                  type="button"
                  className="au-oauth-btn"
                  onClick={() => handleOAuth("facebook")}
                  disabled={oauthLoading !== null}
                >
                  <FacebookMark size={18} /> {oauthLoading === "facebook" ? "Redirecting…" : "Facebook"}
                </button>
              </div>

              <div className="au-toggle">
                Don&apos;t have an account?{" "}
                <button onClick={() => setFlow("signup-persona")}>Create one free</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT SIDE PANEL */}
      <div className="au-side">
        <div className="au-side-tagline">
          Nigeria&apos;s most <em>trusted</em> property platform.
        </div>
        <p className="au-side-sub">
          Every listing screened, every agent verified. Find or list property across all 36 states — without the fraud, without the wasted calls.
        </p>
        <div className="au-stat-row">
          <div className="au-stat">
            <div className="au-stat-num">4,210</div>
            <div className="au-stat-lbl">Verified listings</div>
          </div>
          <div className="au-stat">
            <div className="au-stat-num">980</div>
            <div className="au-stat-lbl">Checked agents</div>
          </div>
          <div className="au-stat">
            <div className="au-stat-num">₦0</div>
            <div className="au-stat-lbl">To list, forever</div>
          </div>
        </div>
        <div className="au-side-cards">
          {SIDE_CARDS.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="au-mini-card">
              <div className="au-mini-card-icon">
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <div className="au-mini-card-body">
                <div className="au-mini-card-title">{title}</div>
                <div className="au-mini-card-sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
