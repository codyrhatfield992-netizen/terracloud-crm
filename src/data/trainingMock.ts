import type { CRMContact, CRMLead, CRMListing, Cohort, FeatureFlag, Feedback, LeaderboardEntry, Organization, PracticeSession, PromptVersion, Rubric, Scenario, SessionScore, SessionTurn, Team, TrainingUser } from "@/types/training";

export const organizations: Organization[] = [
  { id: "org-1", name: "Apex Realty Group", plan: "enterprise", seats: 148, monthlyAiCost: 4280 },
  { id: "org-2", name: "Northline Brokerage", plan: "growth", seats: 42, monthlyAiCost: 940 },
];
export const cohorts: Cohort[] = [
  { id: "cohort-q1", name: "Q1 Listing Conversion", startDate: "2026-01-08", learnerCount: 34 },
  { id: "cohort-elite", name: "Elite Objection Lab", startDate: "2026-02-01", learnerCount: 18 },
];
export const users: TrainingUser[] = [
  { id: "u-1", name: "Maya Chen", email: "maya@apex.test", role: "learner", organizationId: "org-1", teamId: "team-a" },
  { id: "u-2", name: "Jordan Ellis", email: "jordan@apex.test", role: "learner", organizationId: "org-1", teamId: "team-a" },
  { id: "u-3", name: "Priya Nair", email: "priya@apex.test", role: "coach", organizationId: "org-1", teamId: "team-a" },
  { id: "u-4", name: "Marcus Reed", email: "marcus@apex.test", role: "admin", organizationId: "org-1" },
  { id: "u-5", name: "Sofia Alvarez", email: "sofia@apex.test", role: "learner", organizationId: "org-1", teamId: "team-b" },
  { id: "u-6", name: "Theo Grant", email: "theo@apex.test", role: "learner", organizationId: "org-1", teamId: "team-b" },
];
export const teams: Team[] = [
  { id: "team-a", organizationId: "org-1", name: "Silver Team", coachId: "u-3", cohortId: "cohort-q1" },
  { id: "team-b", organizationId: "org-1", name: "Ice Team", coachId: "u-3", cohortId: "cohort-elite" },
];
export const crmLeads: CRMLead[] = [
  { id: "lead-1", name: "Elena Brooks", budget: 1850000, urgency: 91, objections: ["Concerned about tax exposure", "Needs privacy from neighbors"], notes: "Relocating executive. Wants calm, low-friction process.", readiness: 88, source: "CRM lead" },
  { id: "lead-2", name: "Daniel Fox", budget: 920000, urgency: 63, objections: ["Thinks market is overheated", "Wants proof of resale value"], notes: "Analytical buyer. Responds to data and scenario comparisons.", readiness: 71, source: "CRM lead" },
  { id: "lead-3", name: "Camille Hart", budget: 2400000, urgency: 76, objections: ["School district uncertainty", "Concerned about renovation fatigue"], notes: "Family-driven decision. Needs confidence around daily-life fit.", readiness: 79, source: "CRM lead" },
];
export const crmContacts: CRMContact[] = [
  { id: "contact-1", name: "Avery Stone", title: "Founder", company: "Stone Capital", sentiment: "skeptical", lastTouch: "2026-04-21" },
  { id: "contact-2", name: "Nina Patel", title: "VP People", company: "Northstar Labs", sentiment: "warm", lastTouch: "2026-04-20" },
  { id: "contact-3", name: "Cole Winters", title: "Investor", company: "Winters Holdings", sentiment: "neutral", lastTouch: "2026-04-18" },
];
export const crmListings: CRMListing[] = [
  { id: "listing-1", address: "2148 Silver Lake Drive", price: 1725000, beds: 5, baths: 4.5, tags: ["waterfront", "privacy", "renovated"], riskNotes: ["Long driveway may raise maintenance concerns", "Primary suite layout requires framing"] },
  { id: "listing-2", address: "88 Juniper Crest", price: 995000, beds: 4, baths: 3, tags: ["views", "schools", "move-in ready"], riskNotes: ["Small fourth bedroom", "Steep backyard"] },
  { id: "listing-3", address: "701 Harbor Point", price: 2360000, beds: 6, baths: 5, tags: ["estate", "guest wing", "smart home"], riskNotes: ["High HOA", "Modern finish may feel cold"] },
];
export const scenarios: Scenario[] = [
  { id: "scn-1", title: "Waterfront Showing With Hidden Tax Anxiety", drillType: "buyer_consult", source: "crm_lead", difficulty: "hard", persona: "Elena Brooks", summary: "High-budget relocation buyer tests whether the agent can surface privacy and tax concerns before the kitchen tour loses trust.", goals: ["Surface hidden financial anxiety", "Reframe privacy as lifestyle value", "Ask permission before closing"], status: "published", version: 4 },
  { id: "scn-2", title: "Investor Pushback On Resale Value", drillType: "objection_handling", source: "crm_contact", difficulty: "elite", persona: "Avery Stone", summary: "A skeptical investor challenges assumptions and forces evidence-backed repositioning under pressure.", goals: ["Use comps without overloading", "Control pacing", "Earn a micro-commitment"], status: "published", version: 7 },
  { id: "scn-3", title: "Cold Call: Expired Luxury Listing", drillType: "cold_call", source: "generic", difficulty: "medium", persona: "Expired seller", summary: "Seller has heard every pitch. Win attention through diagnosis, not promises.", goals: ["Open with relevance", "Diagnose prior failure", "Secure follow-up"], status: "published", version: 3 },
  { id: "scn-4", title: "Listing Presentation Against Incumbent Agent", drillType: "listing_presentation", source: "listing", difficulty: "hard", persona: "Luxury seller", summary: "Seller likes their current agent but is disappointed in strategy. Prove a sharper repositioning plan.", goals: ["Quantify positioning gap", "Avoid attacking competitor", "Create urgency"], status: "draft", version: 2 },
];
export const rubrics: Rubric[] = [
  { id: "rubric-1", name: "Elite Buyer Consultation", drillType: "buyer_consult", published: true, categories: [
    { id: "r1", label: "Discovery depth", weight: 25, description: "Surfaces motives, risk, and decision criteria." },
    { id: "r2", label: "Trust control", weight: 25, description: "Maintains credibility while pressure rises." },
    { id: "r3", label: "Repositioning", weight: 25, description: "Turns concerns into decision architecture." },
    { id: "r4", label: "Close discipline", weight: 25, description: "Secures a clear next step without rushing." },
  ]},
  { id: "rubric-2", name: "Objection Handling", drillType: "objection_handling", published: true, categories: [
    { id: "r5", label: "Labeling", weight: 20, description: "Names the objection cleanly." },
    { id: "r6", label: "Evidence", weight: 25, description: "Uses proof without sounding defensive." },
    { id: "r7", label: "Emotional calibration", weight: 25, description: "Matches pressure with composure." },
    { id: "r8", label: "Next step", weight: 30, description: "Converts resistance into action." },
  ]},
];
export const practiceSessions: PracticeSession[] = [
  { id: "sess-1", learnerId: "u-1", learnerName: "Maya Chen", scenarioId: "scn-1", scenarioTitle: "Waterfront Showing With Hidden Tax Anxiety", drillType: "buyer_consult", mode: "text", difficulty: "hard", status: "completed", score: 86, startedAt: "2026-04-22T15:24:00Z", durationMinutes: 18, tension: 64, confidence: 82, crmContext: "Elena Brooks · 2148 Silver Lake Drive" },
  { id: "sess-2", learnerId: "u-2", learnerName: "Jordan Ellis", scenarioId: "scn-2", scenarioTitle: "Investor Pushback On Resale Value", drillType: "objection_handling", mode: "text", difficulty: "elite", status: "reviewed", score: 71, startedAt: "2026-04-22T13:10:00Z", durationMinutes: 22, tension: 82, confidence: 61, crmContext: "Avery Stone · 88 Juniper Crest" },
  { id: "sess-3", learnerId: "u-5", learnerName: "Sofia Alvarez", scenarioId: "scn-3", scenarioTitle: "Cold Call: Expired Luxury Listing", drillType: "cold_call", mode: "text", difficulty: "medium", status: "completed", score: 92, startedAt: "2026-04-21T20:42:00Z", durationMinutes: 11, tension: 48, confidence: 89 },
  { id: "sess-4", learnerId: "u-6", learnerName: "Theo Grant", scenarioId: "scn-4", scenarioTitle: "Listing Presentation Against Incumbent Agent", drillType: "listing_presentation", mode: "voice", difficulty: "hard", status: "scheduled", score: 0, startedAt: "2026-04-24T17:00:00Z", durationMinutes: 0, tension: 0, confidence: 0, crmContext: "701 Harbor Point" },
  { id: "sess-5", learnerId: "u-1", learnerName: "Maya Chen", scenarioId: "scn-2", scenarioTitle: "Investor Pushback On Resale Value", drillType: "objection_handling", mode: "text", difficulty: "elite", status: "live", score: 0, startedAt: "2026-04-23T17:02:00Z", durationMinutes: 9, tension: 76, confidence: 68, crmContext: "Daniel Fox · 88 Juniper Crest" },
];
export const sessionTurns: SessionTurn[] = [
  { id: "turn-1", sessionId: "sess-1", speaker: "persona", timestamp: "00:01", text: "I like the home, but I need to know what I'm walking into financially beyond the purchase price.", sentiment: "negative" },
  { id: "turn-2", sessionId: "sess-1", speaker: "learner", timestamp: "00:42", text: "That makes sense. Before we look at finishes, can I map the tax, maintenance, and privacy tradeoffs so you can compare the total ownership picture?", sentiment: "positive" },
  { id: "turn-3", sessionId: "sess-1", speaker: "persona", timestamp: "01:18", text: "Yes. That would help. I do not want a surprise after we emotionally attach to it.", sentiment: "positive" },
  { id: "turn-4", sessionId: "sess-5", speaker: "persona", timestamp: "08:14", text: "Every agent tells me resale is strong. Why should I believe this one is different?", sentiment: "negative" },
  { id: "turn-5", sessionId: "sess-5", speaker: "learner", timestamp: "08:38", text: "I would not ask you to believe it. I would ask you to pressure-test it against three exit scenarios before we keep touring.", sentiment: "positive" },
];
export const sessionScores: SessionScore[] = [
  { sessionId: "sess-1", overall: 86, percentile: 91, categories: [
    { category: "Discovery depth", score: 90, note: "Surfaced total ownership anxiety early." },
    { category: "Trust control", score: 84, note: "Strong pacing; one moment of over-explaining." },
    { category: "Repositioning", score: 88, note: "Converted tax concern into planning advantage." },
    { category: "Close discipline", score: 80, note: "Next step was clear but could be more time-bound." },
  ], strengths: ["Pressure-tested the buyer's financial fear before the tour", "Used permission-based transitions", "Kept language calm and specific"], weaknesses: ["Could quantify privacy value with stronger examples", "Missed a chance to tie school commute to urgency"], missedOpportunities: ["Ask who else must approve the ownership model", "Offer side-by-side carrying-cost view"], rewrites: [{ original: "Taxes are normal for this area.", improved: "Let's separate tax exposure from purchase price so you can decide with the full carrying-cost picture." }], nextDrillId: "scn-2" },
  { sessionId: "sess-2", overall: 71, percentile: 64, categories: [
    { category: "Labeling", score: 82, note: "Named investor skepticism quickly." },
    { category: "Evidence", score: 58, note: "Proof arrived too late and sounded defensive." },
    { category: "Emotional calibration", score: 66, note: "Pacing accelerated under challenge." },
    { category: "Next step", score: 78, note: "Recovered with a clean scenario comparison." },
  ], strengths: ["Did not argue with the buyer", "Recovered with exit-scenario framing"], weaknesses: ["Overloaded the buyer with comp data", "Failed to isolate the strongest resale proof first"], missedOpportunities: ["Use one high-signal comp instead of five", "Ask whether resale or cashflow is the real fear"], rewrites: [{ original: "The comps prove this is safe.", improved: "If resale is the risk, the cleanest test is the worst-case exit. Let's model that first." }], nextDrillId: "scn-1" },
];
export const feedback: Feedback[] = [
  { id: "fb-1", sessionId: "sess-2", coachId: "u-3", severity: "high", note: "Jordan needs repetition on evidence hierarchy under investor pressure.", resolved: false },
  { id: "fb-2", sessionId: "sess-1", coachId: "u-3", severity: "low", note: "Maya is ready for elite difficulty on consults.", resolved: true },
];
export const leaderboard: LeaderboardEntry[] = [
  { id: "lb-1", learnerName: "Sofia Alvarez", rank: 1, score: 92, improvement: 14, streak: 9, sessionsCompleted: 31, team: "Ice Team", drillType: "cold_call" },
  { id: "lb-2", learnerName: "Maya Chen", rank: 2, score: 86, improvement: 11, streak: 7, sessionsCompleted: 28, team: "Silver Team", drillType: "buyer_consult" },
  { id: "lb-3", learnerName: "Theo Grant", rank: 3, score: 78, improvement: 18, streak: 5, sessionsCompleted: 22, team: "Ice Team", drillType: "listing_presentation" },
  { id: "lb-4", learnerName: "Jordan Ellis", rank: 4, score: 71, improvement: 6, streak: 3, sessionsCompleted: 19, team: "Silver Team", drillType: "objection_handling" },
];
export const featureFlags: FeatureFlag[] = [
  { key: "voice_mode", label: "Voice practice", enabled: false, description: "Enable microphone capture and voice persona replies." },
  { key: "hybrid_mode", label: "Hybrid practice", enabled: false, description: "Allow text and voice in the same session." },
  { key: "coach_reviews", label: "Coach review queue", enabled: true, description: "Surface flagged sessions to instructors." },
  { key: "crm_context", label: "CRM scenario context", enabled: true, description: "Use leads, contacts, and listings in scenario setup." },
];
export const promptVersions: PromptVersion[] = [
  { id: "pv-1", name: "Persona Engine", model: "gateway.sales-persona.v4", version: 4, status: "active", costPerSession: 0.42 },
  { id: "pv-2", name: "Structured Scoring", model: "gateway.scoring-json.v3", version: 3, status: "active", costPerSession: 0.28 },
  { id: "pv-3", name: "Realtime Voice Planner", model: "gateway.voice-beta.v1", version: 1, status: "testing", costPerSession: 0.76 },
];
