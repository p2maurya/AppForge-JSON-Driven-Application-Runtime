"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Signup failed");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--ink)",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--accent)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--border)";
  };

  return (
    <div
      className="w-full max-w-sm rounded-2xl border p-8 space-y-6"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="text-sm text-ink-muted">Start building with AppForge</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-ink-muted">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-ink-muted">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-ink-muted">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        {error && (
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          style={{ background: "var(--accent)", color: "white" }}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-center text-ink-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-accent hover:text-accent-hover transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
