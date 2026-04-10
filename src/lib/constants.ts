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

export function getStageLabel(id: string): string {
  return PIPELINE_STAGES.find(s => s.id === id)?.label ?? id;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function formatCompactCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return formatCurrency(n);
}

export function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}
