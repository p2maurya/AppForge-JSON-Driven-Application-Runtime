interface Props {
  errors: string[];
  type?: string;
}

export function FallbackRenderer({ errors, type }: Props) {
  return (
    <div
      className="w-full max-w-lg mx-auto rounded-2xl border p-8 space-y-4"
      style={{
        background: "var(--surface-1)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: "var(--danger)" }}
        />
        <p className="text-sm font-medium">
          {type ? `Unknown component: "${type}"` : "Invalid configuration"}
        </p>
      </div>

      {errors.length > 0 && (
        <ul className="space-y-1">
          {errors.map((e, i) => (
            <li key={i} className="text-sm text-ink-muted pl-4">
              {e}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-ink-faint">
        Edit the config in the editor to fix these issues.
      </p>
    </div>
  );
}
