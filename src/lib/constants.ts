// ─────────────────────────────────────────────────────────────
// CANONICAL DOMAIN CONSTANTS
// All ids are lowercase snake_case. Labels are human-readable.
// This is the single source of truth for stages, statuses, etc.
// ─────────────────────────────────────────────────────────────

export const PIPELINE_STAGES = [
  { id: "new", label: "New Lead", order: 0 },
  { id: "contacted", label: "Contacted", order: 1 },
  { id: "tour", label: "Tour Scheduled", order: 2 },
  { id: "offer", label: "Offer Made", order: 3 },
  { id: "contract", label: "Under Contract", order: 4 },
  { id: "closed", label: "Closed", order: 5 },
  { id: "dead", label: "Dead", order: 6 },
] as const;

export type StageId = (typeof PIPELINE_STAGES)[number]["id"];

const STAGE_LABEL_BY_ID: Record<string, string> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.id, s.label]),
);

export function normalizeStage(raw: string | null | undefined): StageId {
  if (!raw) return "new";
  const k = raw.toLowerCase().trim();
  if (k in STAGE_LABEL_BY_ID) return k as StageId;
  // legacy fallbacks
  if (k === "new lead") return "new";
  if (k === "tour scheduled") return "tour";
  if (k === "offer made") return "offer";
  if (k === "under contract") return "contract";
  return "new";
}

export function getStageLabel(id: string | null | undefined): string {
  return STAGE_LABEL_BY_ID[normalizeStage(id)];
}

// ─────────────────────────────────────────────────────────────
export const PROPERTY_STATUSES = [
  { id: "available", label: "Available" },
  { id: "under_contract", label: "Under Contract" },
  { id: "sold", label: "Sold" },
  { id: "off_market", label: "Off Market" },
] as const;

export type PropertyStatusId = (typeof PROPERTY_STATUSES)[number]["id"];

const PROPERTY_STATUS_LABEL: Record<string, string> = Object.fromEntries(
  PROPERTY_STATUSES.map((s) => [s.id, s.label]),
);

export function normalizePropertyStatus(raw: string | null | undefined): PropertyStatusId {
  if (!raw) return "available";
  const k = raw.toLowerCase().replace(/\s+/g, "_").trim();
  if (k in PROPERTY_STATUS_LABEL) return k as PropertyStatusId;
  if (k === "new") return "available";
  return "available";
}

export function getPropertyStatusLabel(raw: string | null | undefined): string {
  return PROPERTY_STATUS_LABEL[normalizePropertyStatus(raw)];
}

// ─────────────────────────────────────────────────────────────
export const PRIORITIES = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "urgent", label: "Urgent" },
] as const;

export type PriorityId = (typeof PRIORITIES)[number]["id"];

export function normalizePriority(raw: string | null | undefined): PriorityId {
  const k = (raw || "").toLowerCase();
  if (k === "low" || k === "medium" || k === "high" || k === "urgent") return k;
  return "medium";
}

export function getPriorityLabel(raw: string | null | undefined): string {
  const map: Record<PriorityId, string> = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };
  return map[normalizePriority(raw)];
}

// ─────────────────────────────────────────────────────────────
export const CONTACT_TYPES = [
  { id: "seller", label: "Seller" },
  { id: "buyer", label: "Buyer" },
  { id: "agent", label: "Agent" },
  { id: "other", label: "Other" },
] as const;

export type ContactTypeId = (typeof CONTACT_TYPES)[number]["id"];

export function normalizeContactType(raw: string | null | undefined): ContactTypeId {
  const k = (raw || "").toLowerCase();
  if (k === "seller" || k === "buyer" || k === "agent" || k === "other") return k;
  return "other";
}

export function getContactTypeLabel(raw: string | null | undefined): string {
  const map: Record<ContactTypeId, string> = { seller: "Seller", buyer: "Buyer", agent: "Agent", other: "Other" };
  return map[normalizeContactType(raw)];
}

export const PROPERTY_TYPES = ["Single Family", "Multi Family", "Condo", "Townhouse", "Land", "Commercial"] as const;

export const LEAD_SOURCES = [
  "Website", "Referral", "Cold Call", "Direct Mail", "Facebook Ads", "Google Ads", "Zillow", "SMS Campaign", "Networking", "Walk-In", "Other",
] as const;

// ─────────────────────────────────────────────────────────────
// FORMATTERS
// ─────────────────────────────────────────────────────────────

export function formatCurrency(n: number | string | null | undefined): string {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return "$0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

export function formatCompactCurrency(n: number | string | null | undefined): string {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return "$0";
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return formatCurrency(v);
}

const DATE_FMT: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
const TIME_FMT: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };

export function formatDate(input: string | Date | null | undefined, fallback = "—"): string {
  if (!input) return fallback;
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("en-US", DATE_FMT);
}

export function formatDateTime(input: string | Date | null | undefined, fallback = "—"): string {
  if (!input) return fallback;
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return fallback;
  return `${d.toLocaleDateString("en-US", DATE_FMT)} at ${d.toLocaleTimeString("en-US", TIME_FMT)}`;
}

/** For meeting rows that store separate date (YYYY-MM-DD) + time (HH:MM) text fields. */
export function formatMeetingWhen(date: string | null | undefined, time: string | null | undefined): string {
  if (!date && !time) return "No date set";
  if (date && time) {
    const d = new Date(`${date}T${time}`);
    if (!Number.isNaN(d.getTime())) return formatDateTime(d);
  }
  if (date) {
    const d = new Date(`${date}T00:00:00`);
    if (!Number.isNaN(d.getTime())) return formatDate(d);
  }
  return time || "No date set";
}

export function timeAgo(ts: string | null | undefined): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export const TODAY_ISO = () => new Date().toISOString().split("T")[0];

export function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  return dateStr < TODAY_ISO();
}

export function isDueToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  return dateStr === TODAY_ISO();
}
