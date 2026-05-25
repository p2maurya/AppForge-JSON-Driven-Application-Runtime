"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Login failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full max-w-sm rounded-2xl border p-8 space-y-6"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="text-sm text-ink-muted">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-ink-muted">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
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

        <div className="space-y-1.5">
          <label className="text-sm text-ink-muted">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
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

        {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          style={{ background: "var(--accent)", color: "white" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-center text-ink-muted">
        No account?{" "}
        <Link href="/signup" className="text-accent hover:text-accent-hover transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}
