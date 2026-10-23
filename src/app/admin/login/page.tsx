"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createClient();
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage({ kind: "error", text: error.message });
      else {
        router.replace("/admin");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/callback?next=/admin/password`,
      });
      setMessage(error ? { kind: "error", text: error.message } : { kind: "ok", text: "Check your email for a reset link." });
    }
    setBusy(false);
  }

  return (
    <div className="login">
      <form className="panel login-card" onSubmit={submit}>
        <h1>{mode === "login" ? "Dashboard sign in" : "Reset password"}</h1>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {mode === "login" && (
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        )}
        {message && <div className={`notice notice-${message.kind}`}>{message.text}</div>}
        <button className="btn-admin btn-block" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Send reset link"}
        </button>
        <button type="button" className="link-btn" onClick={() => setMode(mode === "login" ? "reset" : "login")}>
          {mode === "login" ? "Forgot password?" : "Back to sign in"}
        </button>
      </form>
    </div>
  );
}
