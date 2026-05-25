"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { AppRenderer } from "@/components/renderer/AppRenderer";
import { validateConfigString } from "@/lib/config-validator";
import type { SafeConfig } from "@/types/config";

interface AppData {
  id: string;
  name: string;
  config: object;
  isPublished: boolean;
}

export default function AppViewPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = use(params);
  const [app, setApp] = useState<AppData | null>(null);
  const [safeConfig, setSafeConfig] = useState<SafeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/apps/${appId}`)
      .then((r) => {
        if (!r.ok) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((json) => {
        if (!json) return;
        const appData = json.data as AppData;
        setApp(appData);
        setSafeConfig(validateConfigString(JSON.stringify(appData.config)));
      })
      .finally(() => setLoading(false));
  }, [appId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !app) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-ink-muted">App not found</p>
        <Link href="/dashboard" className="text-sm text-accent hover:text-accent-hover transition-colors">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--surface-0)" }}
    >
      <header
        className="border-b px-6 py-3 flex items-center justify-between"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface-1)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{app.name}</span>
          {!app.isPublished && (
            <span
              className="text-xs px-2 py-0.5 rounded font-mono"
              style={{
                background: "var(--surface-3)",
                color: "var(--ink-faint)",
              }}
            >
              draft
            </span>
          )}
        </div>
        <Link
          href={`/editor/${appId}`}
          className="text-xs text-ink-muted hover:text-ink transition-colors"
        >
          Edit config
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {safeConfig && (
          <AppRenderer
            config={safeConfig.raw}
            errors={safeConfig.errors}
            appId={appId}
          />
        )}
      </main>
    </div>
  );
}
