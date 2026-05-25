export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "date";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string | number | boolean;
}

export type ComponentType = "form" | "table" | "dashboard" | "layout";

export interface FormConfig {
  type: "form";
  title: string;
  fields: FieldConfig[];
  submitLabel?: string;
  submitAction?: string;
}

export interface TableConfig {
  type: "table";
  title: string;
  columns: ColumnConfig[];
  source?: string;
}

export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface StatConfig {
  label: string;
  valueKey: string;
  format?: "number" | "currency" | "percent";
}

export interface DashboardConfig {
  type: "dashboard";
  title: string;
  stats?: StatConfig[];
  children?: AppConfig[];
}

export interface LayoutConfig {
  type: "layout";
  direction: "row" | "column";
  children: AppConfig[];
}

export type AppConfig =
  | FormConfig
  | TableConfig
  | DashboardConfig
  | LayoutConfig;

export interface SafeConfig {
  type: ComponentType;
  title: string;
  raw: AppConfig | null;
  errors: string[];
}

export interface AppData {
  id: string;
  name: string;
  slug: string;
  config: AppConfig;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecordData {
  id: string;
  appId: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
