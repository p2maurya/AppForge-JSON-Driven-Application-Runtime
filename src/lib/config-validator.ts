import type {
  AppConfig,
  FieldConfig,
  FieldType,
  FormConfig,
  TableConfig,
  SafeConfig,
  ComponentType,
} from "@/types/config";

const VALID_FIELD_TYPES: FieldType[] = [
  "text",
  "email",
  "number",
  "textarea",
  "select",
  "checkbox",
  "date",
];

const VALID_COMPONENT_TYPES: ComponentType[] = [
  "form",
  "table",
  "dashboard",
  "layout",
];

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function sanitizeFieldType(type: unknown): FieldType {
  if (typeof type === "string" && VALID_FIELD_TYPES.includes(type as FieldType)) {
    return type as FieldType;
  }
  return "text";
}

function sanitizeField(raw: unknown, index: number): FieldConfig {
  if (!isObject(raw)) {
    return {
      name: `field_${index}`,
      label: `Field ${index}`,
      type: "text",
    };
  }

  const name =
    typeof raw.name === "string" && raw.name.trim()
      ? raw.name.trim()
      : `field_${index}`;

  const label =
    typeof raw.label === "string" && raw.label.trim()
      ? raw.label.trim()
      : name;

  const type = sanitizeFieldType(raw.type);

  const field: FieldConfig = { name, label, type };

  if (typeof raw.required === "boolean") field.required = raw.required;
  if (typeof raw.placeholder === "string") field.placeholder = raw.placeholder;
  if (typeof raw.defaultValue !== "undefined") {
    field.defaultValue = raw.defaultValue as string | number | boolean;
  }

  if (type === "select" && Array.isArray(raw.options)) {
    field.options = raw.options
      .filter((o) => typeof o === "string")
      .map((o) => o as string);
    if (field.options.length === 0) field.options = ["Option 1", "Option 2"];
  }

  return field;
}

function sanitizeFormConfig(raw: Record<string, unknown>): FormConfig {
  const title =
    typeof raw.title === "string" && raw.title.trim()
      ? raw.title
      : "Untitled Form";

  const rawFields = Array.isArray(raw.fields) ? raw.fields : [];
  const fields = rawFields.map((f, i) => sanitizeField(f, i));

  if (fields.length === 0) {
    fields.push({ name: "field_0", label: "Field", type: "text" });
  }

  return {
    type: "form",
    title,
    fields,
    submitLabel:
      typeof raw.submitLabel === "string" ? raw.submitLabel : "Submit",
  };
}

function sanitizeTableConfig(raw: Record<string, unknown>): TableConfig {
  const title =
    typeof raw.title === "string" && raw.title.trim()
      ? raw.title
      : "Untitled Table";

  const rawColumns = Array.isArray(raw.columns) ? raw.columns : [];
  const columns = rawColumns
    .filter(isObject)
    .map((c, i) => ({
      key: typeof c.key === "string" && c.key ? c.key : `col_${i}`,
      label: typeof c.label === "string" && c.label ? c.label : `Column ${i}`,
      sortable: typeof c.sortable === "boolean" ? c.sortable : false,
    }));

  return { type: "table", title, columns };
}

export function parseConfig(input: unknown): {
  config: AppConfig | null;
  errors: string[];
} {
  const errors: string[] = [];

  if (!isObject(input)) {
    errors.push("Config must be a JSON object");
    return { config: null, errors };
  }

  const type = input.type;

  if (!type || !VALID_COMPONENT_TYPES.includes(type as ComponentType)) {
    errors.push(
      `Unknown component type "${type}". Defaulting to form.`
    );
    return {
      config: sanitizeFormConfig(input),
      errors,
    };
  }

  switch (type) {
    case "form":
      return { config: sanitizeFormConfig(input), errors };

    case "table":
      return { config: sanitizeTableConfig(input), errors };

    case "dashboard": {
      const title =
        typeof input.title === "string" ? input.title : "Untitled Dashboard";
      return {
        config: { type: "dashboard", title, children: [] },
        errors,
      };
    }

    case "layout": {
      const direction =
        input.direction === "row" || input.direction === "column"
          ? input.direction
          : "column";
      return {
        config: { type: "layout", direction, children: [] },
        errors,
      };
    }

    default:
      errors.push(`Unhandled type: ${type}`);
      return { config: sanitizeFormConfig(input), errors };
  }
}

export function validateConfigString(raw: string): SafeConfig {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      type: "form",
      title: "Invalid Config",
      raw: null,
      errors: ["Invalid JSON syntax"],
    };
  }

  const { config, errors } = parseConfig(parsed);

  return {
    type: (config?.type as ComponentType) ?? "form",
    title: (config as { title?: string })?.title ?? "Untitled",
    raw: config,
    errors,
  };
}
