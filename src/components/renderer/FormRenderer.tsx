"use client";

import { useState } from "react";
import type { FormConfig, FieldConfig } from "@/types/config";

interface Props {
  config: FormConfig;
  appId: string;
}

function buildInitialState(fields: FieldConfig[]): Record<string, string | boolean> {
  const state: Record<string, string | boolean> = {};
  for (const f of fields) {
    if (f.type === "checkbox") {
      state[f.name] = f.defaultValue === true;
    } else {
      state[f.name] = typeof f.defaultValue === "string" ? f.defaultValue : "";
    }
  }
  return state;
}

interface FieldProps {
  field: FieldConfig;
  value: string | boolean;
  onChange: (val: string | boolean) => void;
}

function Field({ field, value, onChange }: FieldProps) {
  const base =
    "w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors";
  const style = {
    background: "var(--surface-0)",
    border: "1px solid var(--border)",
    color: "var(--ink)",
  };
  const focusStyle = { borderColor: "var(--accent)" };
  const blurStyle = { borderColor: "var(--border)" };

  if (field.type === "checkbox") {
    return (
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={field.name}
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded"
          style={{ accentColor: "var(--accent)" }}
        />
        <label
          htmlFor={field.name}
          className="text-sm"
          style={{ color: "var(--ink)" }}
        >
          {field.label}
        </label>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-1.5">
        <label className="text-sm" style={{ color: "var(--ink-muted)" }}>
          {field.label}
          {field.required && (
            <span className="ml-1" style={{ color: "var(--danger)" }}>
              *
            </span>
          )}
        </label>
        <textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          rows={4}
          className={`${base} resize-none`}
          style={style}
          onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
          onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-1.5">
        <label className="text-sm" style={{ color: "var(--ink-muted)" }}>
          {field.label}
          {field.required && (
            <span className="ml-1" style={{ color: "var(--danger)" }}>
              *
            </span>
          )}
        </label>
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={base}
          style={style}
          onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
          onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
        >
          <option value="">Select...</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const inputType =
    field.type === "email"
      ? "email"
      : field.type === "number"
      ? "number"
      : field.type === "date"
      ? "date"
      : "text";

  return (
    <div className="space-y-1.5">
      <label className="text-sm" style={{ color: "var(--ink-muted)" }}>
        {field.label}
        {field.required && (
          <span className="ml-1" style={{ color: "var(--danger)" }}>
            *
          </span>
        )}
      </label>
      <input
        type={inputType}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        className={base}
        style={style}
        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
      />
    </div>
  );
}

export function FormRenderer({ config, appId }: Props) {
  const [values, setValues] = useState(() => buildInitialState(config.fields));
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function setValue(name: string, val: string | boolean) {
    setValues((prev) => ({ ...prev, [name]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");

    try {
      const body: Record<string, unknown> = {};
      for (const field of config.fields) {
        const val = values[field.name];
        if (field.type === "number") {
          body[field.name] = val === "" ? undefined : Number(val);
        } else {
          body[field.name] = val;
        }
      }

      const res = await fetch(`/api/runtime/${appId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(json.error ?? "Submission failed");
        return;
      }

      setStatus("success");
      setValues(buildInitialState(config.fields));
    } catch {
      setStatus("error");
      setErrorMsg("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="w-full max-w-lg mx-auto rounded-2xl border p-8 space-y-6"
      style={{
        background: "var(--surface-1)",
        borderColor: "var(--border)",
      }}
    >
      <h2 className="text-lg font-semibold">{config.title}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {config.fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={values[field.name] ?? ""}
            onChange={(val) => setValue(field.name, val)}
          />
        ))}

        {status === "error" && (
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            {errorMsg}
          </p>
        )}

        {status === "success" && (
          <p className="text-sm" style={{ color: "#4ade80" }}>
            Submitted successfully
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          style={{ background: "var(--accent)", color: "white" }}
        >
          {submitting ? "Submitting..." : (config.submitLabel ?? "Submit")}
        </button>
      </form>
    </div>
  );
}
