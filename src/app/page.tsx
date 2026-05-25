import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-mono text-accent tracking-widest uppercase">
            AppForge
          </p>
          <h1
            className="text-5xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Build apps from{" "}
            <span className="text-accent">configuration</span>
          </h1>
          <p className="text-ink-muted text-lg leading-relaxed">
            Define your app in JSON. Get a working frontend, API, and database
            automatically.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="px-6 py-2.5 text-ink-muted hover:text-ink text-sm transition-colors"
          >
            Sign in
          </Link>
        </div>

        <div
          className="rounded-xl border p-6 text-left font-mono text-sm space-y-1"
          style={{
            background: "var(--surface-1)",
            borderColor: "var(--border)",
            color: "var(--ink-muted)",
          }}
        >
          <p>
            <span style={{ color: "var(--accent)" }}>{"{"}</span>
          </p>
          <p className="pl-4">
            <span style={{ color: "var(--accent-hover)" }}>&quot;type&quot;</span>
            {": "}
            <span style={{ color: "#86efac" }}>&quot;form&quot;</span>,
          </p>
          <p className="pl-4">
            <span style={{ color: "var(--accent-hover)" }}>&quot;title&quot;</span>
            {": "}
            <span style={{ color: "#86efac" }}>&quot;User Registration&quot;</span>,
          </p>
          <p className="pl-4">
            <span style={{ color: "var(--accent-hover)" }}>&quot;fields&quot;</span>
            {": "}[...]
          </p>
          <p>
            <span style={{ color: "var(--accent)" }}>{"}"}</span>
          </p>
        </div>
      </div>
    </main>
  );
}
