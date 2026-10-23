"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Reached from the reset email (signed in by the link) or from the sidebar to change the password.
export default function ChangePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message);
    else router.replace("/admin");
  }

  return (
    <form className="panel login-card" onSubmit={submit}>
      <h1>Set a new password</h1>
      <div className="field">
        <label htmlFor="pw">New password</label>
        <input id="pw" type="password" minLength={8} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <div className="notice notice-error">{error}</div>}
      <button className="btn-admin btn-block" disabled={busy}>
        {busy ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
