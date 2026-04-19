// ─────────────────────────────────────────────────────────────
// TerraCloud XR — Buyer Intelligence Layer
// Deterministic synthetic data derived from a record's id.
// Real CRM data (name, budget, address) stays the source of truth;
// this layer adds behavioral / simulation overlays for the demo.
// ─────────────────────────────────────────────────────────────

export const ARCHETYPES = [
  { id: "luxury", label: "Luxury Buyer", color: "violet", description: "Status-conscious, expects premium service and exclusivity." },
  { id: "skeptical", label: "Skeptical Investor", color: "amber", description: "Numbers-driven, low trust, demands proof and ROI." },
  { id: "family", label: "Overwhelmed Family", color: "cyan", description: "Emotional, time-pressured, needs reassurance and clarity." },
  { id: "first_time", label: "First-Time Couple", color: "primary", description: "Nervous, learning, sensitive to pressure and pacing." },
  { id: "analytical", label: "Analytical Engineer", color: "primary", description: "Detail-obsessed, wants specs, blueprints, and data." },
  { id: "ego", label: "Ego-Driven Client", color: "destructive", description: "Confidence-testing, interrupts, expects deference." },
] as const;

export type ArchetypeId = (typeof ARCHETYPES)[number]["id"];

export const COMM_STYLES = ["Direct", "Reserved", "Animated", "Cautious", "Inquisitive", "Decisive"] as const;
export const OBJECTION_LIBRARY = [
  "Price feels high vs comps",
  "School district concerns",
  "HOA fees not justified",
  "Worried about resale value",
  "Wants 30-day close, not 45",
  "Spouse not aligned yet",
  "Needs financing contingency",
  "Foundation/inspection anxiety",
  "Commute time too long",
  "Backyard too small",
  "Kitchen needs full remodel",
  "Concerned about market timing",
];

// Stable hash from string id → 0..1
function hash01(seed: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function pick<T>(arr: readonly T[], seed: string, salt = 0): T {
  return arr[Math.floor(hash01(seed, salt) * arr.length)];
}

function range(seed: string, salt: number, min: number, max: number): number {
  return Math.round(min + hash01(seed, salt) * (max - min));
}

// ─────────────────────────────────────────────────────────────
// Lead → Buyer Intelligence Profile
// ─────────────────────────────────────────────────────────────

export interface BuyerProfile {
  archetype: (typeof ARCHETYPES)[number];
  trustLevel: number;       // 0-100
  riskLevel: number;        // 0-100
  urgency: number;          // 0-100
  emotionalReactivity: number; // 0-100
  decisionSpeed: number;    // 0-100
  commStyle: string;
  objections: string[];
  simulationReadiness: "ready" | "needs_data" | "calibrating";
  trustSignature: string;   // short tag like "Cautious–Verifying"
}

export function getBuyerProfile(leadId: string): BuyerProfile {
  const archetype = pick(ARCHETYPES, leadId, 1);
  const trust = range(leadId, 2, 22, 92);
  const risk = range(leadId, 3, 15, 85);
  const urgency = range(leadId, 4, 25, 95);
  const reactivity = range(leadId, 5, 20, 90);
  const speed = range(leadId, 6, 15, 88);
  const style = pick(COMM_STYLES, leadId, 7);

  const objCount = 2 + Math.floor(hash01(leadId, 8) * 3);
  const objections: string[] = [];
  const used = new Set<number>();
  while (objections.length < objCount) {
    const idx = Math.floor(hash01(leadId, 9 + objections.length) * OBJECTION_LIBRARY.length);
    if (!used.has(idx)) {
      used.add(idx);
      objections.push(OBJECTION_LIBRARY[idx]);
    }
  }

  const readiness: BuyerProfile["simulationReadiness"] =
    trust > 60 ? "ready" : trust > 35 ? "calibrating" : "needs_data";

  const trustSignature =
    trust > 70 ? "Open–Engaged"
    : trust > 50 ? "Cautious–Verifying"
    : trust > 30 ? "Guarded–Testing"
    : "Closed–Defensive";

  return {
    archetype,
    trustLevel: trust,
    riskLevel: risk,
    urgency,
    emotionalReactivity: reactivity,
    decisionSpeed: speed,
    commStyle: style,
    objections,
    simulationReadiness: readiness,
    trustSignature,
  };
}

// ─────────────────────────────────────────────────────────────
// Property → Listing Intelligence
// ─────────────────────────────────────────────────────────────

export interface ListingIntel {
  digitalTwinStatus: "ready" | "scanning" | "queued";
  walkthroughComplexity: "simple" | "moderate" | "complex";
  simulationReadiness: number; // 0-100
  vrReady: boolean;
  hotspots: string[];
  sellingPoints: string[];
}

const HOTSPOTS = [
  "Master suite reveal",
  "Kitchen open-concept",
  "Backyard transition",
  "Basement condition",
  "Garage capacity",
  "Curb appeal moment",
  "Natural light test",
  "School proximity walk",
];

const SELLING_POINTS = [
  "Recently renovated kitchen",
  "South-facing exposure",
  "Top-rated school zone",
  "Walk-in pantry",
  "Smart-home wired",
  "Fully fenced yard",
  "EV charger installed",
  "Below market PSF",
  "Quiet cul-de-sac",
];

export function getListingIntel(propertyId: string): ListingIntel {
  const r = range(propertyId, 11, 0, 100);
  const dt: ListingIntel["digitalTwinStatus"] = r > 65 ? "ready" : r > 35 ? "scanning" : "queued";
  const cx: ListingIntel["walkthroughComplexity"] = r > 70 ? "complex" : r > 35 ? "moderate" : "simple";
  const readiness = dt === "ready" ? range(propertyId, 12, 70, 98) : dt === "scanning" ? range(propertyId, 12, 40, 70) : range(propertyId, 12, 10, 40);

  const hsCount = 2 + Math.floor(hash01(propertyId, 13) * 3);
  const hotspots = Array.from({ length: hsCount }, (_, i) => HOTSPOTS[Math.floor(hash01(propertyId, 14 + i) * HOTSPOTS.length)]);

  const spCount = 3 + Math.floor(hash01(propertyId, 20) * 3);
  const sellingPoints = Array.from({ length: spCount }, (_, i) => SELLING_POINTS[Math.floor(hash01(propertyId, 21 + i) * SELLING_POINTS.length)]);

  return {
    digitalTwinStatus: dt,
    walkthroughComplexity: cx,
    simulationReadiness: readiness,
    vrReady: dt === "ready",
    hotspots: Array.from(new Set(hotspots)),
    sellingPoints: Array.from(new Set(sellingPoints)),
  };
}

// ─────────────────────────────────────────────────────────────
// Lead × Property → Fit / Compatibility
// ─────────────────────────────────────────────────────────────

export interface FitAnalysis {
  fitScore: number;        // 0-100
  trustForecast: number;   // 0-100
  closeProbability: number;// 0-100
  matchReasons: string[];
  riskFlags: string[];
}

export function getFitAnalysis(leadId: string, propertyId: string): FitAnalysis {
  const seed = `${leadId}::${propertyId}`;
  const fit = range(seed, 1, 32, 96);
  const trust = range(seed, 2, 25, 90);
  const close = Math.round((fit * 0.6 + trust * 0.4) * 0.85);

  const reasonsPool = [
    "Budget aligns with asking price",
    "Property type matches preference",
    "Location matches commute target",
    "Bedroom count fits family size",
    "School zone matches priority",
    "Walkable neighborhood preference",
  ];
  const flagsPool = [
    "Buyer prefers newer build",
    "HOA may trigger objection",
    "Price 8% above buyer ceiling",
    "Inspection risk on roof age",
    "Spouse alignment uncertain",
    "Competing offer expected",
  ];

  const matchReasons = Array.from(new Set(
    Array.from({ length: 3 }, (_, i) => reasonsPool[Math.floor(hash01(seed, 10 + i) * reasonsPool.length)])
  ));
  const riskFlags = Array.from(new Set(
    Array.from({ length: 2 }, (_, i) => flagsPool[Math.floor(hash01(seed, 20 + i) * flagsPool.length)])
  ));

  return { fitScore: fit, trustForecast: trust, closeProbability: close, matchReasons, riskFlags };
}

// ─────────────────────────────────────────────────────────────
// Activity / Notes / Conversations (mock, deterministic)
// ─────────────────────────────────────────────────────────────

const NOTE_TEMPLATES = [
  { type: "call", title: "Discovery call · 18 min", body: "Walked through buyer's prior home loss; loss-aversion is high. Mentioned wife is the decision blocker." },
  { type: "email", title: "Sent comp set + tax projection", body: "Pre-loaded 3 properties under their ceiling with HOA-included utilities to defuse the fee anxiety." },
  { type: "meeting", title: "In-person tour · Riverside", body: "Client lingered in primary suite — emotional anchor. Negative reaction to street noise; flag for next showing." },
  { type: "note", title: "Behavioral observation", body: "Mirrors body language when in agreement. Crosses arms before objections — early-warning tell." },
  { type: "call", title: "Follow-up call · 6 min", body: "Wanted clarity on 30-day close. Confirmed financing pre-approved at 7.1%. Spouse joining next showing." },
  { type: "sms", title: "Confirmed Saturday tour", body: "Client requested no kids' rooms be staged — wife wants neutral baseline to project." },
];

export interface ActivityItem {
  type: "call" | "email" | "meeting" | "note" | "sms";
  title: string;
  body: string;
  timestamp: string; // ISO
}

export function getLeadActivity(leadId: string): ActivityItem[] {
  const count = 3 + Math.floor(hash01(leadId, 30) * 3);
  const items: ActivityItem[] = [];
  for (let i = 0; i < count; i++) {
    const t = NOTE_TEMPLATES[Math.floor(hash01(leadId, 30 + i) * NOTE_TEMPLATES.length)];
    items.push({
      type: t.type as ActivityItem["type"],
      title: t.title,
      body: t.body,
      timestamp: new Date(Date.now() - (i + 1) * (1 + hash01(leadId, 40 + i) * 4) * 86400_000).toISOString(),
    });
  }
  return items;
}

const MOTIVATION_TEMPLATES = [
  "Relocating for new role · 60-day window",
  "Outgrew current home · second child arriving",
  "Investment portfolio rebalance · seeking yield",
  "Downsizing post-empty-nest · prioritizing lock-and-leave",
  "Lifestyle upgrade · wants city skyline view",
  "Tax-driven move · cost-basis sensitive",
];

const FAMILY_TEMPLATES = [
  "Married · 2 kids (8, 11)",
  "Single · no dependents",
  "Married · expecting first child",
  "Married · empty-nesters",
  "Domestic partnership · 1 dog",
  "Single parent · 1 teen",
];

const TIMELINE_TEMPLATES = [
  "Aggressive · 30-day close",
  "Standard · 45-60 days",
  "Flexible · 90 days",
  "Exploratory · 6+ months",
];

export interface LeadDeepProfile {
  motivation: string;
  family: string;
  timeline: string;
  motivationScore: number; // 0-100
  pastConversations: number;
  budgetCeiling: number;
  desiredType: string;
}

const DESIRED_TYPES = ["Single-Family", "Luxury Estate", "Modern Loft", "Townhome", "New Build", "Investment Multi-Family"];

export function getDeepProfile(leadId: string, baseValue: number): LeadDeepProfile {
  return {
    motivation: pick(MOTIVATION_TEMPLATES, leadId, 50),
    family: pick(FAMILY_TEMPLATES, leadId, 51),
    timeline: pick(TIMELINE_TEMPLATES, leadId, 52),
    motivationScore: range(leadId, 53, 35, 95),
    pastConversations: range(leadId, 54, 2, 14),
    budgetCeiling: Math.max(baseValue, 250_000) + range(leadId, 55, 0, 200_000),
    desiredType: pick(DESIRED_TYPES, leadId, 56),
  };
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

export function archetypeColorClass(id: ArchetypeId): string {
  switch (id) {
    case "luxury": return "text-xr-violet bg-xr-violet/10 border-xr-violet/30";
    case "skeptical": return "text-xr-amber bg-xr-amber/10 border-xr-amber/30";
    case "family": return "text-xr-cyan bg-xr-cyan/10 border-xr-cyan/30";
    case "first_time": return "text-foreground bg-foreground/5 border-foreground/20";
    case "analytical": return "text-foreground bg-foreground/5 border-foreground/20";
    case "ego": return "text-destructive bg-destructive/10 border-destructive/30";
  }
}

export function readinessColor(r: BuyerProfile["simulationReadiness"]): string {
  return r === "ready" ? "bg-success" : r === "calibrating" ? "bg-warning" : "bg-muted-foreground";
}

export function readinessLabel(r: BuyerProfile["simulationReadiness"]): string {
  return r === "ready" ? "Simulation Ready" : r === "calibrating" ? "Calibrating" : "Needs Data";
}
