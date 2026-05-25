"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { ConfigEditor } from "@/components/editor/ConfigEditor";
import { AppRenderer } from "@/components/renderer/AppRenderer";
import { validateConfigString } from "@/lib/config-validator";
import type { SafeConfig } from "@/types/config";

interface AppData {
  id: string;
  name: string;
  config: object;
  isPublished: boolean;
}

export default function EditorPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = use(params);
  const { user, loading } = useAuth(true);
  const [app, setApp] = useState<AppData | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [safeConfig, setSafeConfig] = useState<SafeConfig | null>(null);
  const [rawConfig, setRawConfig] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [publishing, setPublishing] = useState(false);

  const fetchApp = useCallback(async () => {
    const res = await fetch(`/api/apps/${appId}`);
    const json = await res.json();
    if (res.ok) {
      const appData = json.data as AppData;
      setApp(appData);
      const raw = JSON.stringify(appData.config, null, 2);
      setRawConfig(raw);
      setSafeConfig(validateConfigString(raw));
    }
    setAppLoading(false);
  }, [appId]);

  useEffect(() => {
    if (!loading && user) fetchApp();
  }, [loading, user, fetchApp]);

  function handleConfigChange(safe: SafeConfig, raw: string) {
    setSafeConfig(safe);
    setRawConfig(raw);
    setSaved(false);
  }

  async function save() {
    if (!safeConfig?.raw) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/apps/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: safeConfig.raw }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish() {
    if (!app) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/apps/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !app.isPublished }),
      });
      const json = await res.json();
      if (res.ok) setApp(json.data);
    } finally {
      setPublishing(false);
    }
  }

  if (loading || appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-muted">App not found</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--surface-0)" }}
    >
      <header
        className="border-b px-4 py-3 flex items-center gap-4"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface-1)",
        }}
      >
        <Link
          href="/dashboard"
          className="text-ink-muted hover:text-ink transition-colors text-sm"
        >
          ← Dashboard
        </Link>

        <span
          className="h-4 w-px"
          style={{ background: "var(--border)" }}
        />

        <span className="text-sm font-medium">{app.name}</span>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={togglePublish}
            disabled={publishing}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
            style={{
              borderColor: "var(--border)",
              color: app.isPublished ? "#4ade80" : "var(--ink-muted)",
              background: app.isPublished
                ? "rgba(74, 222, 128, 0.05)"
                : "transparent",
            }}
          >
            {app.isPublished ? "● Live" : "○ Draft"}
          </button>

          <Link
            href={`/app-view/${appId}`}
            target="_blank"
            className="text-xs text-ink-muted hover:text-ink transition-colors"
          >
            Open app ↗
          </Link>

          <button
            onClick={save}
            disabled={saving || !safeConfig?.raw}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            style={{ background: "var(--accent)", color: "white" }}
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div
          className="flex flex-col w-1/2 border-r"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="flex border-b px-4"
            style={{ borderColor: "var(--border)" }}
          >
            {(["editor", "preview"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-3 py-2.5 text-xs font-medium capitalize transition-colors"
                style={{
                  color:
                    activeTab === tab ? "var(--ink)" : "var(--ink-muted)",
                  borderBottom:
                    activeTab === tab
                      ? "1px solid var(--accent)"
                      : "1px solid transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 overflow-auto">
            {activeTab === "editor" ? (
              <div className="h-full" style={{ minHeight: "400px" }}>
                <ConfigEditor
                  initialValue={rawConfig}
                  onChange={handleConfigChange}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-mono text-ink-muted">
                  Parsed config
                </p>
                <pre
                  className="text-xs font-mono p-4 rounded-xl overflow-auto"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--ink-muted)",
                  }}
                >
                  {JSON.stringify(safeConfig?.raw, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-2xl mx-auto">
            {safeConfig ? (
              <AppRenderer
                config={safeConfig.raw}
                errors={safeConfig.errors}
                appId={appId}
              />
            ) : (
              <div className="text-ink-muted text-sm">Loading preview...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
