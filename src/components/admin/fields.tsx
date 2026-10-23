"use client";

import { useState } from "react";
import { FONT_OPTIONS } from "@/lib/defaults";
import { createClient } from "@/lib/supabase/client";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "money"
  | "url"
  | "image"
  | "checkbox"
  | "select"
  | "color"
  | "font"
  | "datetime";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  min?: number;
  max?: number;
}

function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

export function Field({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = `f-${def.name}`;
  let input: React.ReactNode;
  switch (def.type) {
    case "textarea":
      input = (
        <textarea id={id} rows={5} value={(value as string) ?? ""} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />
      );
      break;
    case "number":
    case "money":
      input = (
        <input
          id={id}
          type="number"
          step={def.type === "money" ? "0.01" : "1"}
          min={def.min}
          max={def.max}
          value={value === null || value === undefined ? "" : String(value)}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      );
      break;
    case "checkbox":
      return (
        <label className="check">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span>
            {def.label}
            {def.help && <small>{def.help}</small>}
          </span>
        </label>
      );
    case "select":
      input = (
        <select id={id} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "color":
      input = <ColorInput id={id} value={(value as string) ?? ""} onChange={onChange} />;
      break;
    case "font":
      input = (
        <>
          <input id={id} list="font-options" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
          <datalist id="font-options">
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
        </>
      );
      break;
    case "datetime":
      input = (
        <input
          id={id}
          type="datetime-local"
          value={toLocalInput(value as string)}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
        />
      );
      break;
    case "image":
      input = <ImageInput value={(value as string) ?? ""} onChange={onChange} />;
      break;
    default:
      input = (
        <input
          id={id}
          type={def.type === "url" ? "text" : "text"}
          inputMode={def.type === "url" ? "url" : undefined}
          value={(value as string) ?? ""}
          placeholder={def.placeholder}
          required={def.required}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
  return (
    <div className="field">
      <label htmlFor={id}>
        {def.label}
        {def.required && <span className="req"> *</span>}
      </label>
      {input}
      {def.help && <small className="help">{def.help}</small>}
    </div>
  );
}

function ColorInput({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const isHex = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <div className="color-row">
      <input type="color" aria-label="Pick color" value={isHex ? value : "#000000"} onChange={(e) => onChange(e.target.value)} />
      <input id={id} value={value} placeholder="Default" onChange={(e) => onChange(e.target.value)} />
      {value && (
        <button type="button" className="link-btn" onClick={() => onChange("")}>
          Clear
        </button>
      )}
    </div>
  );
}

export function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setBusy(true);
    setError("");
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
    if (error) setError(error.message);
    else onChange(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
    setBusy(false);
  }

  return (
    <div className="image-input">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="image-preview" />
      )}
      <div className="image-actions">
        <label className="btn-admin btn-secondary">
          {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
        </label>
        {value && (
          <button type="button" className="link-btn danger" onClick={() => onChange("")}>
            Remove
          </button>
        )}
      </div>
      <input value={value} placeholder="…or paste an image link" onChange={(e) => onChange(e.target.value)} />
      {error && <small className="error">{error}</small>}
    </div>
  );
}
