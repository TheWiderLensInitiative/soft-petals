"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CollectionDef } from "./collections";
import { Field } from "./fields";

type Row = Record<string, unknown> & { id?: string; sort_order?: number; active?: boolean };

export function CollectionEditor({ def }: { def: CollectionDef }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await createClient()
      .from(def.table)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) setMessage({ kind: "error", text: error.message });
    setRows(data ?? []);
    setLoading(false);
  }, [def.table]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!editing) return;
    const missing = def.fields.find((f) => f.required && !editing[f.name]);
    if (missing) {
      setMessage({ kind: "error", text: `${missing.label} is required.` });
      return;
    }
    setSaving(true);
    const payload: Row = {};
    for (const f of def.fields) payload[f.name] = editing[f.name] ?? null;
    if (def.table === "promotions") payload.updated_at = new Date().toISOString();
    const db = createClient().from(def.table);
    const { error } = editing.id
      ? await db.update(payload).eq("id", editing.id)
      : await db.insert({ ...payload, sort_order: rows.length });
    setSaving(false);
    if (error) {
      setMessage({ kind: "error", text: error.message });
      return;
    }
    setMessage({ kind: "ok", text: "Saved. It's live on the website now." });
    setEditing(null);
    load();
  }

  async function remove(row: Row) {
    const name = (row[def.titleField] as string) || `this ${def.singular}`;
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    const { error } = await createClient().from(def.table).delete().eq("id", row.id!);
    if (error) setMessage({ kind: "error", text: error.message });
    else {
      setMessage({ kind: "ok", text: "Deleted." });
      if (editing?.id === row.id) setEditing(null);
      load();
    }
  }

  async function toggle(row: Row) {
    const { error } = await createClient().from(def.table).update({ active: !row.active }).eq("id", row.id!);
    if (error) setMessage({ kind: "error", text: error.message });
    else load();
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    const db = createClient();
    const results = await Promise.all(
      next.map((r, i) => (r.sort_order === i ? null : db.from(def.table).update({ sort_order: i }).eq("id", r.id!))),
    );
    const failed = results.find((r) => r?.error);
    if (failed?.error) setMessage({ kind: "error", text: failed.error.message });
    load();
  }

  return (
    <div className="collection">
      <div className="page-head">
        <div>
          <h1>{def.label}</h1>
          <p className="muted">{def.intro}</p>
        </div>
        <button className="btn-admin" onClick={() => setEditing({ ...def.blank })}>
          + Add {def.singular}
        </button>
      </div>

      {message && (
        <div className={`notice notice-${message.kind}`} onClick={() => setMessage(null)}>
          {message.text}
        </div>
      )}

      {editing && (
        <div className="panel editor">
          <h2>{editing.id ? `Edit ${def.singular}` : `New ${def.singular}`}</h2>
          <div className="fields">
            {def.fields.map((f) => (
              <Field key={f.name} def={f} value={editing[f.name]} onChange={(v) => setEditing({ ...editing, [f.name]: v })} />
            ))}
          </div>
          <div className="editor-actions">
            <button className="btn-admin" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button className="btn-admin btn-secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="panel empty">No {def.label.toLowerCase()} yet. Click “Add {def.singular}” to create one.</div>
      ) : (
        <ul className="rows">
          {rows.map((row, i) => (
            <li key={row.id} className={`row ${row.active === false ? "row-off" : ""}`}>
              <div className="row-order">
                <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  ▲
                </button>
                <button aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
                  ▼
                </button>
              </div>
              {def.imageField &&
                (row[def.imageField] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row[def.imageField] as string} alt="" className="row-thumb" />
                ) : (
                  <div className="row-thumb" />
                ))}
              <div className="row-main">
                <strong>{(row[def.titleField] as string) || `Untitled ${def.singular}`}</strong>
                {def.subtitle && <small>{def.subtitle(row)}</small>}
              </div>
              <div className="row-actions">
                <button className={`pill ${row.active ? "pill-on" : ""}`} onClick={() => toggle(row)}>
                  {row.active ? "Showing" : "Hidden"}
                </button>
                <button className="link-btn" onClick={() => {
                    setEditing({ ...row });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}>
                  Edit
                </button>
                <button className="link-btn danger" onClick={() => remove(row)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
