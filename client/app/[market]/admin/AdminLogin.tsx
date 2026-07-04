"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { adminLogin } from "./actions";

export function AdminLogin() {
  const [state, action, pending] = useActionState(adminLogin, null);

  return (
    <div className="adm-login">
      <div className="adm-login__box">
        <div className="adm-login__icon">
          <ShieldCheck size={32} strokeWidth={1.5} />
        </div>
        <h1 className="adm-login__title">Admin Access</h1>
        <p className="adm-login__sub">PropertyConnect — verification queue</p>
        <form action={action} className="adm-login__form">
          <input
            type="password"
            name="password"
            placeholder="Admin password"
            autoComplete="current-password"
            required
            className="adm-login__input"
          />
          {state?.error && <p className="adm-login__err">{state.error}</p>}
          <button type="submit" disabled={pending} className="adm-login__btn">
            {pending ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
