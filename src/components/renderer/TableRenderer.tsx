"use client";

import { useState, useEffect, useCallback } from "react";
import type { TableConfig } from "@/types/config";

interface Props {
  config: TableConfig;
  appId: string;
}

interface RecordItem {
  id: string;
  data: Record<string, unknown>;
  createdAt: string;
}

interface PageData {
  records: RecordItem[];
  total: number;
  page: number;
  pages: number;
}

export function TableRenderer({ config, appId }: Props) {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/runtime/${appId}?page=${page}&limit=20`);
      const json = await res.json();
      if (res.ok) setPageData(json.data);
    } finally {
      setLoading(false);
    }
  }, [appId, page]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const rows = pageData?.records ?? [];

  const sorted = [...rows].sort((a, b) => {
    if (!sortKey) return 0;
    const av = String(a.data[sortKey] ?? "");
    const bv = String(b.data[sortKey] ?? "");
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const columns =
    config.columns.length > 0
      ? config.columns
      : rows.length > 0
      ? Object.keys(rows[0].data).map((k) => ({ key: k, label: k, sortable: true }))
      : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{config.title}</h2>
        {pageData && (
          <span className="text-sm text-ink-muted">
            {pageData.total} record{pageData.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left font-medium text-ink-muted select-none"
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={{ cursor: col.sortable ? "pointer" : "default" }}
                  >
                    <span className="flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && sortKey === col.key && (
                        <span style={{ color: "var(--accent)" }}>
                          {sortDir === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-medium text-ink-muted">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-8 text-center text-ink-muted"
                  >
                    Loading...
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-8 text-center text-ink-muted"
                  >
                    No records yet
                  </td>
                </tr>
              ) : (
                sorted.map((row, i) => (
                  <tr
                    key={row.id}
                    style={{
                      background:
                        i % 2 === 0 ? "var(--surface-1)" : "var(--surface-2)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3"
                        style={{ color: "var(--ink)" }}
                      >
                        {String(row.data[col.key] ?? "—")}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-ink-faint text-xs">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pageData && pageData.pages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm text-ink-muted hover:text-ink disabled:opacity-30 transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-ink-muted">
            Page {page} of {pageData.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageData.pages, p + 1))}
            disabled={page === pageData.pages}
            className="text-sm text-ink-muted hover:text-ink disabled:opacity-30 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
