"use client";

import type { AppConfig } from "@/types/config";
import { FormRenderer } from "./FormRenderer";
import { TableRenderer } from "./TableRenderer";
import { FallbackRenderer } from "./FallbackRenderer";

interface Props {
  config: AppConfig | null;
  errors: string[];
  appId: string;
}

export function AppRenderer({ config, errors, appId }: Props) {
  if (!config) {
    return <FallbackRenderer errors={errors} />;
  }

  try {
    switch (config.type) {
      case "form":
        return <FormRenderer config={config} appId={appId} />;

      case "table":
        return <TableRenderer config={config} appId={appId} />;

      case "dashboard":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{config.title}</h2>
            <p className="text-sm text-ink-muted">Dashboard coming soon</p>
          </div>
        );

      case "layout":
        return (
          <div
            className={
              config.direction === "row"
                ? "flex gap-6"
                : "flex flex-col gap-6"
            }
          >
            {config.children?.map((child, i) => (
              <AppRenderer key={i} config={child} errors={[]} appId={appId} />
            ))}
          </div>
        );

      default:
        return (
          <FallbackRenderer
            errors={[`Unknown component type`]}
            type={(config as { type: string }).type}
          />
        );
    }
  } catch {
    return (
      <FallbackRenderer errors={["Renderer crashed — check your config"]} />
    );
  }
}
