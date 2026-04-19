// Mock simulation runs + deal autopsies for the TerraCloud XR demo.
// In a real product these would persist to Supabase; for the pitch they live in-memory.

export type SimulationStatus = "live" | "completed" | "scheduled" | "failed";
export type SimulationMode = "vr" | "desktop";

export interface SimulationRun {
  id: string;
  scenarioName: string;
  clientName: string;
  clientArchetype: string;
  propertyAddress: string;
  status: SimulationStatus;
  mode: SimulationMode;
  score: number; // 0-100
  trustEnd: number;
  walkthroughCoverage: number; // %
  duration: string;
  ranAt: string;
  outcome: "closed" | "follow_up" | "lost" | "in_progress";
  objectionsHit: number;
  objectionsHandled: number;
}

export const SIMULATIONS: SimulationRun[] = [
  {
    id: "sim_01",
    scenarioName: "Sunset Ridge Walkthrough · Run 03",
    clientName: "Marcus Chen",
    clientArchetype: "Skeptical Investor",
    propertyAddress: "4218 Sunset Ridge Dr, Austin TX",
    status: "live",
    mode: "vr",
    score: 78,
    trustEnd: 64,
    walkthroughCoverage: 72,
    duration: "00:18:42",
    ranAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    outcome: "in_progress",
    objectionsHit: 5,
    objectionsHandled: 3,
  },
  {
    id: "sim_02",
    scenarioName: "Heritage Oaks Reveal · Run 12",
    clientName: "Priya & Daniel Shah",
    clientArchetype: "Overwhelmed Family",
    propertyAddress: "812 Heritage Oaks Ln, Plano TX",
    status: "completed",
    mode: "desktop",
    score: 91,
    trustEnd: 88,
    walkthroughCoverage: 96,
    duration: "00:24:11",
    ranAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    outcome: "closed",
    objectionsHit: 4,
    objectionsHandled: 4,
  },
  {
    id: "sim_03",
    scenarioName: "Lakeshore Estate · Run 02",
    clientName: "Eleanor Vance",
    clientArchetype: "Luxury Buyer",
    propertyAddress: "27 Lakeshore Estate Way, Westlake TX",
    status: "completed",
    mode: "vr",
    score: 64,
    trustEnd: 49,
    walkthroughCoverage: 81,
    duration: "00:31:08",
    ranAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    outcome: "follow_up",
    objectionsHit: 7,
    objectionsHandled: 4,
  },
  {
    id: "sim_04",
    scenarioName: "Maple Court Tour · Run 08",
    clientName: "Jamie & Robin Carter",
    clientArchetype: "First-Time Couple",
    propertyAddress: "1402 Maple Ct, Round Rock TX",
    status: "completed",
    mode: "desktop",
    score: 83,
    trustEnd: 79,
    walkthroughCoverage: 88,
    duration: "00:21:33",
    ranAt: new Date(Date.now() - 1 * 86400_000).toISOString(),
    outcome: "closed",
    objectionsHit: 3,
    objectionsHandled: 3,
  },
  {
    id: "sim_05",
    scenarioName: "Ironwood Loft · Run 01",
    clientName: "Dr. Aiden Park",
    clientArchetype: "Analytical Engineer",
    propertyAddress: "55 Ironwood Loft #12B, Austin TX",
    status: "completed",
    mode: "vr",
    score: 72,
    trustEnd: 68,
    walkthroughCoverage: 91,
    duration: "00:28:55",
    ranAt: new Date(Date.now() - 1.5 * 86400_000).toISOString(),
    outcome: "follow_up",
    objectionsHit: 6,
    objectionsHandled: 5,
  },
  {
    id: "sim_06",
    scenarioName: "Crestview Estate · Run 04",
    clientName: "Victor Halloway",
    clientArchetype: "Ego-Driven Client",
    propertyAddress: "9 Crestview Estate Dr, Dallas TX",
    status: "completed",
    mode: "vr",
    score: 38,
    trustEnd: 22,
    walkthroughCoverage: 54,
    duration: "00:14:02",
    ranAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    outcome: "lost",
    objectionsHit: 9,
    objectionsHandled: 2,
  },
  {
    id: "sim_07",
    scenarioName: "Brookfield Cottage · Run 02",
    clientName: "Helena Kowalski",
    clientArchetype: "Skeptical Investor",
    propertyAddress: "2201 Brookfield Cottage Rd, Cedar Park TX",
    status: "scheduled",
    mode: "desktop",
    score: 0,
    trustEnd: 0,
    walkthroughCoverage: 0,
    duration: "—",
    ranAt: new Date(Date.now() + 4 * 3600_000).toISOString(),
    outcome: "in_progress",
    objectionsHit: 0,
    objectionsHandled: 0,
  },
  {
    id: "sim_08",
    scenarioName: "Magnolia Park · Run 06",
    clientName: "Theo Marchetti",
    clientArchetype: "Luxury Buyer",
    propertyAddress: "318 Magnolia Park Ave, Houston TX",
    status: "completed",
    mode: "vr",
    score: 86,
    trustEnd: 82,
    walkthroughCoverage: 94,
    duration: "00:26:18",
    ranAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
    outcome: "closed",
    objectionsHit: 5,
    objectionsHandled: 5,
  },
  {
    id: "sim_09",
    scenarioName: "Westbrook Townhome · Run 01",
    clientName: "Lina Okafor",
    clientArchetype: "First-Time Couple",
    propertyAddress: "44 Westbrook Mews, Austin TX",
    status: "completed",
    mode: "desktop",
    score: 58,
    trustEnd: 51,
    walkthroughCoverage: 73,
    duration: "00:19:47",
    ranAt: new Date(Date.now() - 4 * 86400_000).toISOString(),
    outcome: "follow_up",
    objectionsHit: 4,
    objectionsHandled: 2,
  },
  {
    id: "sim_10",
    scenarioName: "Pinehurst Villa · Run 03",
    clientName: "Reza Tahiri",
    clientArchetype: "Analytical Engineer",
    propertyAddress: "12 Pinehurst Villa Ct, Frisco TX",
    status: "failed",
    mode: "vr",
    score: 0,
    trustEnd: 0,
    walkthroughCoverage: 22,
    duration: "00:04:11",
    ranAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
    outcome: "lost",
    objectionsHit: 2,
    objectionsHandled: 0,
  },
  {
    id: "sim_11",
    scenarioName: "Riverbend Estate · Run 02",
    clientName: "Marcus Chen",
    clientArchetype: "Skeptical Investor",
    propertyAddress: "880 Riverbend Estate Dr, Austin TX",
    status: "completed",
    mode: "vr",
    score: 70,
    trustEnd: 66,
    walkthroughCoverage: 89,
    duration: "00:23:09",
    ranAt: new Date(Date.now() - 6 * 86400_000).toISOString(),
    outcome: "follow_up",
    objectionsHit: 6,
    objectionsHandled: 4,
  },
  {
    id: "sim_12",
    scenarioName: "Cedar Knoll · Run 04",
    clientName: "Naomi Rivers",
    clientArchetype: "Overwhelmed Family",
    propertyAddress: "67 Cedar Knoll Pl, Round Rock TX",
    status: "completed",
    mode: "desktop",
    score: 88,
    trustEnd: 84,
    walkthroughCoverage: 95,
    duration: "00:25:44",
    ranAt: new Date(Date.now() - 7 * 86400_000).toISOString(),
    outcome: "closed",
    objectionsHit: 3,
    objectionsHandled: 3,
  },
];

// ─────────────────────────────────────────────────────────────
// Deal Autopsies
// ─────────────────────────────────────────────────────────────

export interface AutopsyRoom {
  name: string;
  coverage: number; // 0-100
  trustDelta: number; // -50..+50
  notes: string;
}

export interface DealAutopsy {
  id: string;
  simulationId: string;
  scenarioName: string;
  clientName: string;
  clientArchetype: string;
  propertyAddress: string;
  outcome: "closed" | "lost" | "follow_up";
  overallScore: number;
  trustTimeline: { t: string; v: number }[];
  breakdownPoint: { room: string; minute: string; cause: string } | null;
  rooms: AutopsyRoom[];
  missedObjections: string[];
  missedOpportunities: string[];
  toneScore: number;
  pacingScore: number;
  professionalismScore: number;
  recommendations: string[];
  ranAt: string;
}

export const AUTOPSIES: DealAutopsy[] = [
  {
    id: "aut_01",
    simulationId: "sim_06",
    scenarioName: "Crestview Estate · Run 04",
    clientName: "Victor Halloway",
    clientArchetype: "Ego-Driven Client",
    propertyAddress: "9 Crestview Estate Dr, Dallas TX",
    outcome: "lost",
    overallScore: 38,
    trustTimeline: [
      { t: "0:00", v: 60 }, { t: "2:00", v: 58 }, { t: "5:00", v: 52 },
      { t: "8:00", v: 41 }, { t: "11:00", v: 28 }, { t: "14:00", v: 22 },
    ],
    breakdownPoint: { room: "Master Suite", minute: "8:42", cause: "Buyer felt rushed; agent dismissed objection on closet size." },
    rooms: [
      { name: "Foyer", coverage: 95, trustDelta: -2, notes: "Strong opening; mirrored buyer pace." },
      { name: "Kitchen", coverage: 88, trustDelta: -6, notes: "Skipped over appliance brands client asked about." },
      { name: "Living Room", coverage: 76, trustDelta: -4, notes: "Failed to acknowledge ceiling height concern." },
      { name: "Master Suite", coverage: 54, trustDelta: -19, notes: "Critical breakdown — interrupted client mid-sentence." },
      { name: "Backyard", coverage: 22, trustDelta: -8, notes: "Walkthrough abandoned by client." },
      { name: "Garage", coverage: 0, trustDelta: 0, notes: "Not visited." },
    ],
    missedObjections: ["Closet size", "Lot privacy", "HOA architectural rules"],
    missedOpportunities: ["Did not surface recent comp at $1.2M", "Skipped smart-home demo"],
    toneScore: 42,
    pacingScore: 31,
    professionalismScore: 58,
    recommendations: [
      "Allow ego-driven clients to lead pace — never interrupt.",
      "Pre-stage closet objection with measurement data.",
      "Reframe objections as 'great question' before answering.",
    ],
    ranAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
  },
  {
    id: "aut_02",
    simulationId: "sim_03",
    scenarioName: "Lakeshore Estate · Run 02",
    clientName: "Eleanor Vance",
    clientArchetype: "Luxury Buyer",
    propertyAddress: "27 Lakeshore Estate Way, Westlake TX",
    outcome: "follow_up",
    overallScore: 64,
    trustTimeline: [
      { t: "0:00", v: 70 }, { t: "5:00", v: 72 }, { t: "10:00", v: 68 },
      { t: "15:00", v: 60 }, { t: "20:00", v: 52 }, { t: "25:00", v: 49 },
    ],
    breakdownPoint: { room: "Wine Cellar", minute: "17:20", cause: "Client expected concierge-level reveal; pacing was retail-grade." },
    rooms: [
      { name: "Foyer", coverage: 100, trustDelta: +4, notes: "Premium opening line landed well." },
      { name: "Great Room", coverage: 96, trustDelta: +2, notes: "View moment executed correctly." },
      { name: "Chef's Kitchen", coverage: 92, trustDelta: -3, notes: "Forgot to mention Wolf range provenance." },
      { name: "Master Wing", coverage: 88, trustDelta: -5, notes: "Spa narrative felt scripted." },
      { name: "Wine Cellar", coverage: 72, trustDelta: -11, notes: "Critical drop — no story, no exclusivity framing." },
      { name: "Pool Terrace", coverage: 64, trustDelta: -2, notes: "Client disengaged; finished quickly." },
    ],
    missedObjections: ["Privacy from neighbors", "Property tax trajectory"],
    missedOpportunities: ["No mention of architect pedigree", "Skipped wine cellar inventory anecdote"],
    toneScore: 68,
    pacingScore: 55,
    professionalismScore: 78,
    recommendations: [
      "For luxury buyers, every room needs a story — not specs.",
      "Pre-load 3 exclusivity hooks per simulation.",
      "Slow pacing 30% in marquee rooms.",
    ],
    ranAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
  },
  {
    id: "aut_03",
    simulationId: "sim_02",
    scenarioName: "Heritage Oaks Reveal · Run 12",
    clientName: "Priya & Daniel Shah",
    clientArchetype: "Overwhelmed Family",
    propertyAddress: "812 Heritage Oaks Ln, Plano TX",
    outcome: "closed",
    overallScore: 91,
    trustTimeline: [
      { t: "0:00", v: 55 }, { t: "5:00", v: 64 }, { t: "10:00", v: 72 },
      { t: "15:00", v: 80 }, { t: "20:00", v: 86 }, { t: "24:00", v: 88 },
    ],
    breakdownPoint: null,
    rooms: [
      { name: "Foyer", coverage: 100, trustDelta: +6, notes: "Acknowledged kids by name — instant rapport." },
      { name: "Family Room", coverage: 100, trustDelta: +9, notes: "Highlighted sightlines from kitchen — perfect for parents." },
      { name: "Kids' Wing", coverage: 98, trustDelta: +12, notes: "Showed wall-anchor points; pre-empted safety question." },
      { name: "Backyard", coverage: 96, trustDelta: +7, notes: "Demoed fence security; clients visibly relaxed." },
      { name: "Master Suite", coverage: 94, trustDelta: +4, notes: "Quiet sell — let space speak." },
      { name: "Garage / Storage", coverage: 88, trustDelta: +2, notes: "Surfaced bike-rack idea for kids." },
    ],
    missedObjections: [],
    missedOpportunities: ["Could have surfaced school PTA contact"],
    toneScore: 94,
    pacingScore: 92,
    professionalismScore: 96,
    recommendations: [
      "Replicate this flow as the template for family archetypes.",
      "Codify 'pre-empt safety question' as standard play.",
    ],
    ranAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: "aut_04",
    simulationId: "sim_10",
    scenarioName: "Pinehurst Villa · Run 03",
    clientName: "Reza Tahiri",
    clientArchetype: "Analytical Engineer",
    propertyAddress: "12 Pinehurst Villa Ct, Frisco TX",
    outcome: "lost",
    overallScore: 22,
    trustTimeline: [
      { t: "0:00", v: 50 }, { t: "1:00", v: 38 }, { t: "2:00", v: 24 },
      { t: "3:00", v: 18 }, { t: "4:00", v: 12 },
    ],
    breakdownPoint: { room: "Foyer", minute: "1:42", cause: "Could not produce HVAC tonnage when asked. Client lost confidence." },
    rooms: [
      { name: "Foyer", coverage: 60, trustDelta: -32, notes: "Total breakdown in opening 90 seconds." },
      { name: "Kitchen", coverage: 22, trustDelta: -6, notes: "Client visibly disengaged." },
    ],
    missedObjections: ["HVAC tonnage", "Insulation R-value", "Foundation type"],
    missedOpportunities: ["Did not have spec sheet preloaded"],
    toneScore: 48,
    pacingScore: 30,
    professionalismScore: 55,
    recommendations: [
      "Always preload spec sheet for analytical archetypes.",
      "Trust collapse in <2min is irrecoverable — abort and reschedule.",
    ],
    ranAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
  },
  {
    id: "aut_05",
    simulationId: "sim_05",
    scenarioName: "Ironwood Loft · Run 01",
    clientName: "Dr. Aiden Park",
    clientArchetype: "Analytical Engineer",
    propertyAddress: "55 Ironwood Loft #12B, Austin TX",
    outcome: "follow_up",
    overallScore: 72,
    trustTimeline: [
      { t: "0:00", v: 60 }, { t: "5:00", v: 66 }, { t: "10:00", v: 70 },
      { t: "15:00", v: 72 }, { t: "20:00", v: 70 }, { t: "28:00", v: 68 },
    ],
    breakdownPoint: { room: "Mechanical Room", minute: "22:10", cause: "Client requested boiler service history; not available." },
    rooms: [
      { name: "Lobby", coverage: 100, trustDelta: +3, notes: "Building-systems intro landed well." },
      { name: "Open Plan", coverage: 96, trustDelta: +5, notes: "Spec sheet referenced 4x — strong." },
      { name: "Office Nook", coverage: 92, trustDelta: +2, notes: "Acoustic data shared." },
      { name: "Master", coverage: 88, trustDelta: 0, notes: "Adequate." },
      { name: "Mechanical Room", coverage: 80, trustDelta: -8, notes: "Missing service docs cost trust." },
    ],
    missedObjections: ["Boiler service history"],
    missedOpportunities: ["Could have offered to fetch docs in 24h"],
    toneScore: 76,
    pacingScore: 80,
    professionalismScore: 84,
    recommendations: [
      "Have building service records ready for analytical archetypes.",
      "When data missing, commit to delivery within 24h instead of deflecting.",
    ],
    ranAt: new Date(Date.now() - 1.5 * 86400_000).toISOString(),
  },
  {
    id: "aut_06",
    simulationId: "sim_09",
    scenarioName: "Westbrook Townhome · Run 01",
    clientName: "Lina Okafor",
    clientArchetype: "First-Time Couple",
    propertyAddress: "44 Westbrook Mews, Austin TX",
    outcome: "follow_up",
    overallScore: 58,
    trustTimeline: [
      { t: "0:00", v: 60 }, { t: "5:00", v: 64 }, { t: "10:00", v: 58 },
      { t: "15:00", v: 52 }, { t: "20:00", v: 51 },
    ],
    breakdownPoint: { room: "HOA Discussion", minute: "12:30", cause: "Brought up HOA fees without context — buyer anxiety spiked." },
    rooms: [
      { name: "Entry", coverage: 100, trustDelta: +4, notes: "Warm greeting." },
      { name: "Living Area", coverage: 92, trustDelta: +2, notes: "Furniture-fit examples helped." },
      { name: "Kitchen", coverage: 88, trustDelta: 0, notes: "Standard." },
      { name: "Bedrooms", coverage: 76, trustDelta: -3, notes: "Skipped office-conversion potential." },
      { name: "HOA Discussion", coverage: 60, trustDelta: -9, notes: "Anxiety triggered — no reframe." },
    ],
    missedObjections: ["HOA flexibility", "Pet policy"],
    missedOpportunities: ["Did not show comparable HOA-included properties"],
    toneScore: 70,
    pacingScore: 64,
    professionalismScore: 72,
    recommendations: [
      "Frame HOA fees as included services before quoting cost.",
      "First-time couples need pacing — never compress decisions.",
    ],
    ranAt: new Date(Date.now() - 4 * 86400_000).toISOString(),
  },
];

export function getSimulationById(id: string): SimulationRun | undefined {
  return SIMULATIONS.find(s => s.id === id);
}

export function getAutopsyById(id: string): DealAutopsy | undefined {
  return AUTOPSIES.find(a => a.id === id);
}

export function statusColor(s: SimulationStatus): string {
  switch (s) {
    case "live": return "text-success bg-success/10 border-success/30";
    case "completed": return "text-primary bg-primary/10 border-primary/30";
    case "scheduled": return "text-xr-cyan bg-xr-cyan/10 border-xr-cyan/30";
    case "failed": return "text-destructive bg-destructive/10 border-destructive/30";
  }
}

export function outcomeColor(o: SimulationRun["outcome"]): string {
  switch (o) {
    case "closed": return "text-success";
    case "follow_up": return "text-warning";
    case "lost": return "text-destructive";
    case "in_progress": return "text-xr-cyan";
  }
}
