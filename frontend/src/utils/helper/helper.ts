export const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong";
};

export const buildPath = (pathTemplate: string, id: number | string) =>
  pathTemplate.replace(":id", id.toString());

export const getInitials = (name?: string): string => {
  if (!name) return "G";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.charAt(0) || "") + (parts[1]?.charAt(0) || "")).toUpperCase();
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatCurrency = (value: number | null | undefined): string =>
  inr.format(Math.round(value ?? 0));

/** Keeps only digits and returns the last 10 (drops +91 / 0 prefixes). */
export const normalizePhone = (value: string): string =>
  value.replace(/\D/g, "").slice(-10);

export const maskId = (value?: string): string => {
  if (!value) return "-";
  return value.length <= 4 ? value : `${"•".repeat(value.length - 4)}${value.slice(-4)}`;
};

export const formatDuration = (minutes: number): string => {
  const m = Math.max(0, Math.round(minutes));
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const mm = m % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${String(mm).padStart(2, "0")}m`;
  return `${mm}m`;
};

export const filterEmptyFields = (obj: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== "" && v !== undefined && v !== null)
  );
