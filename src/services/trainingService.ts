import { cohorts, crmContacts, crmLeads, crmListings, featureFlags, feedback, leaderboard, organizations, practiceSessions, promptVersions, rubrics, scenarios, sessionScores, sessionTurns, teams, users } from "@/data/trainingMock";
import type { Difficulty, DrillType, PracticeMode, PracticeSession, ScenarioSource } from "@/types/training";

const wait = <T,>(data: T, ms = 120) => new Promise<T>((resolve) => setTimeout(() => resolve(data), ms));

export const trainingService = {
  async getDashboard() {
    const learnerSessions = practiceSessions.filter((s) => s.learnerId === "u-1");
    const completed = learnerSessions.filter((s) => s.status === "completed" || s.status === "reviewed");
    return wait({ lastSession: completed[0], recentSessions: practiceSessions, leaderboardPreview: leaderboard.slice(0, 4), strengths: ["Consultative framing", "Permission-based closes", "High-pressure composure"], weaknesses: ["Evidence hierarchy", "Quantifying financial risk", "Sharper time-bound next steps"], weeklyImprovement: 11, streak: 7, recommendedScenario: scenarios[1] });
  },
  async getLauncherOptions() { return wait({ scenarios, crmLeads, crmContacts, crmListings }); },
  async previewScenario(input: { drillType: DrillType; source: ScenarioSource; difficulty: Difficulty }) {
    const scenario = scenarios.find((s) => s.drillType === input.drillType && s.source === input.source) ?? scenarios.find((s) => s.drillType === input.drillType) ?? scenarios[0];
    return wait({ ...scenario, difficulty: input.difficulty, structuredOutput: { persona_state: "guarded", hidden_objection: "financial risk", success_condition: "earns a micro-commitment", scoring_schema: rubrics[0].categories.map((c) => c.label) } });
  },
  async createSession(input: { scenarioId: string; mode: PracticeMode; difficulty: Difficulty }) {
    const scenario = scenarios.find((s) => s.id === input.scenarioId) ?? scenarios[0];
    const session: PracticeSession = { id: "sess-live", learnerId: "u-1", learnerName: "Maya Chen", scenarioId: scenario.id, scenarioTitle: scenario.title, drillType: scenario.drillType, mode: input.mode, difficulty: input.difficulty, status: "live", score: 0, startedAt: new Date().toISOString(), durationMinutes: 0, tension: 58, confidence: 72, crmContext: scenario.persona };
    return wait(session);
  },
  async getSession(id: string) { return wait(practiceSessions.find((s) => s.id === id) ?? practiceSessions[0]); },
  async getSessionTurns(id: string) { return wait(sessionTurns.filter((t) => t.sessionId === id || id === "sess-live")); },
  async getSessionScore(id: string) { return wait(sessionScores.find((s) => s.sessionId === id) ?? sessionScores[0]); },
  async getHistory() { return wait(practiceSessions); },
  async getLeaderboard() { return wait(leaderboard); },
  async getCoachDashboard() {
    return wait({ learners: users.filter((u) => u.role === "learner"), sessions: practiceSessions, feedback, teams, heatmap: [
      { skill: "Discovery", Maya: 90, Jordan: 74, Sofia: 81, Theo: 68 },
      { skill: "Objections", Maya: 78, Jordan: 58, Sofia: 88, Theo: 71 },
      { skill: "Closing", Maya: 80, Jordan: 69, Sofia: 85, Theo: 73 },
      { skill: "Pacing", Maya: 84, Jordan: 62, Sofia: 91, Theo: 76 },
    ] });
  },
  async getAdminCMS() { return wait({ scenarios, rubrics, organizations, teams, cohorts, featureFlags, promptVersions, sessions: practiceSessions, audit: sessionTurns }); },
};
