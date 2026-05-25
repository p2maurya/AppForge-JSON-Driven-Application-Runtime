"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface AppItem {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  updatedAt: string;
  config: { type: string; title?: string };
}

const DEFAULT_CONFIG = JSON.stringify(
  {
    type: "form",
    title: "My Form",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
    submitLabel: "Submit",
  },
  null,
  2
);

export default function DashboardPage() {
  const { user, loading, logout } = useAuth(true);
  const router = useRouter();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchApps = useCallback(async () => {
    try {
      const res = await fetch("/api/apps");
      const json = await res.json();
      if (res.ok) setApps(json.data ?? []);
    } finally {
      setAppsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) fetchApps();
  }, [loading, user, fetchApps]);

  async function createApp() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), config: JSON.parse(DEFAULT_CONFIG) }),
      });
      const json = await res.json();
      if (res.ok) {
        setShowModal(false);
        setNewName("");
        router.push(`/editor/${json.data.id}`);
      }
    } finally {
      setCreating(false);
    }
  }

  async function deleteApp(id: string) {
    await fetch(`/api/apps/${id}`, { method: "DELETE" });
    setApps((prev) => prev.filter((a) => a.id !== id));
    setDeleteTarget(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--surface-0)" }}>
      <header
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: "var(--border)", background: "var(--surface-1)" }}
      >
        <span className="font-mono text-sm font-medium text-accent">AppForge</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-muted">{user?.email}</span>
          <button
            onClick={logout}
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Your apps</h1>
            <p className="text-sm text-ink-muted mt-1">
              {apps.length} {apps.length === 1 ? "app" : "apps"}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: "var(--accent)", color: "white" }}
          >
            New app
          </button>
        </div>

        {appsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border h-32 animate-pulse"
                style={{
                  background: "var(--surface-1)",
                  borderColor: "var(--border)",
                }}
              />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div
            className="rounded-xl border p-16 text-center space-y-3"
            style={{
              background: "var(--surface-1)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-ink-muted">No apps yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-accent hover:text-accent-hover transition-colors"
            >
              Create your first app →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border p-5 space-y-4 group"
                style={{
                  background: "var(--surface-1)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{app.name}</p>
                    <p className="text-xs text-ink-faint font-mono">{app.config.type}</p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-mono"
                    style={{
                      background: app.isPublished
                        ? "rgba(74, 222, 128, 0.1)"
                        : "var(--surface-3)",
                      color: app.isPublished ? "#4ade80" : "var(--ink-faint)",
                    }}
                  >
                    {app.isPublished ? "live" : "draft"}
                  </span>
                </div>

                <p className="text-xs text-ink-faint">
                  {new Date(app.updatedAt).toLocaleDateString()}
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <Link
                    href={`/editor/${app.id}`}
                    className="text-xs text-ink-muted hover:text-ink transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/app-view/${app.id}`}
                    className="text-xs text-accent hover:text-accent-hover transition-colors"
                  >
                    View app →
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(app.id)}
                    className="text-xs ml-auto transition-colors"
                    style={{ color: "var(--ink-faint)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--danger)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--ink-faint)")
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6 space-y-5"
            style={{
              background: "var(--surface-1)",
              borderColor: "var(--border)",
            }}
          >
            <h2 className="font-semibold">New app</h2>
            <div className="space-y-1.5">
              <label className="text-sm text-ink-muted">App name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createApp()}
                autoFocus
                placeholder="My awesome app"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--ink)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-ink-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createApp}
                disabled={creating || !newName.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                style={{ background: "var(--accent)", color: "white" }}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border p-6 space-y-5"
            style={{
              background: "var(--surface-1)",
              borderColor: "var(--border)",
            }}
          >
            <div className="space-y-1">
              <h2 className="font-semibold">Delete app</h2>
              <p className="text-sm text-ink-muted">This cannot be undone.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-ink-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteApp(deleteTarget)}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: "var(--danger)", color: "white" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
