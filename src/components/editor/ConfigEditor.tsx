"use client";

import { useState, useEffect, useRef } from "react";
import { validateConfigString } from "@/lib/config-validator";
import type { SafeConfig } from "@/types/config";

interface Props {
  initialValue: string;
  onChange: (safe: SafeConfig, raw: string) => void;
}

export function ConfigEditor({ initialValue, onChange }: Props) {
  const [raw, setRaw] = useState(initialValue);
  const [safe, setSafe] = useState<SafeConfig>(() =>
    validateConfigString(initialValue)
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const result = validateConfigString(raw);
      setSafe(result);
      onChange(result, raw);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [raw, onChange]);

  const lineCount = raw.split("\n").length;

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-ink-muted">config.json</span>
        <div className="flex items-center gap-2">
          {safe.errors.length > 0 ? (
            <span
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{
                background: "rgba(244, 63, 94, 0.1)",
                color: "var(--danger)",
              }}
            >
              {safe.errors.length} error{safe.errors.length > 1 ? "s" : ""}
            </span>
          ) : (
            <span
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{
                background: "rgba(74, 222, 128, 0.1)",
                color: "#4ade80",
              }}
            >
              valid
            </span>
          )}
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        <div
          className="absolute inset-0 flex rounded-xl overflow-hidden border"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-0)",
          }}
        >
          <div
            className="py-4 pl-3 pr-2 text-right select-none text-xs font-mono leading-6"
            style={{
              color: "var(--ink-faint)",
              minWidth: "3rem",
              borderRight: "1px solid var(--border)",
            }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            spellCheck={false}
            className="flex-1 p-4 resize-none outline-none text-xs font-mono leading-6 bg-transparent"
            style={{ color: "var(--ink)", tabSize: 2 }}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                const newVal =
                  raw.substring(0, start) + "  " + raw.substring(end);
                setRaw(newVal);
                requestAnimationFrame(() => {
                  e.currentTarget.selectionStart = start + 2;
                  e.currentTarget.selectionEnd = start + 2;
                });
              }
            }}
          />
        </div>
      </div>

      {safe.errors.length > 0 && (
        <ul className="space-y-1">
          {safe.errors.map((e, i) => (
            <li key={i} className="text-xs font-mono" style={{ color: "var(--danger)" }}>
              ↳ {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
