export type UserRole = "learner" | "coach" | "admin";
export type DrillType = "discovery" | "objection_handling" | "closing" | "cold_call" | "listing_presentation" | "buyer_consult";
export type ScenarioSource = "generic" | "crm_lead" | "crm_contact" | "listing";
export type PracticeMode = "text" | "voice" | "hybrid";
export type Difficulty = "easy" | "medium" | "hard" | "elite";
export type SessionStatus = "scheduled" | "live" | "paused" | "completed" | "reviewed";

export interface TrainingUser { id: string; name: string; email: string; role: UserRole; organizationId: string; teamId?: string; avatar?: string; }
export interface Organization { id: string; name: string; plan: "pilot" | "growth" | "enterprise"; seats: number; monthlyAiCost: number; }
export interface Team { id: string; organizationId: string; name: string; coachId: string; cohortId: string; }
export interface Cohort { id: string; name: string; startDate: string; learnerCount: number; }
export interface CRMLead { id: string; name: string; budget: number; urgency: number; objections: string[]; notes: string; readiness: number; source: string; }
export interface CRMContact { id: string; name: string; title: string; company: string; sentiment: "warm" | "neutral" | "skeptical"; lastTouch: string; }
export interface CRMListing { id: string; address: string; price: number; beds: number; baths: number; tags: string[]; riskNotes: string[]; }
export interface Scenario { id: string; title: string; drillType: DrillType; source: ScenarioSource; difficulty: Difficulty; persona: string; summary: string; goals: string[]; status: "draft" | "published"; version: number; }
export interface RubricCategory { id: string; label: string; weight: number; description: string; }
export interface Rubric { id: string; name: string; drillType: DrillType; categories: RubricCategory[]; published: boolean; }
export interface SessionTurn { id: string; sessionId: string; speaker: "learner" | "persona" | "coach"; text: string; timestamp: string; sentiment?: "positive" | "neutral" | "negative"; }
export interface CategoryScore { category: string; score: number; note: string; }
export interface SessionScore { sessionId: string; overall: number; percentile: number; categories: CategoryScore[]; strengths: string[]; weaknesses: string[]; missedOpportunities: string[]; rewrites: { original: string; improved: string }[]; nextDrillId: string; }
export interface PracticeSession { id: string; learnerId: string; learnerName: string; scenarioId: string; scenarioTitle: string; drillType: DrillType; mode: PracticeMode; difficulty: Difficulty; status: SessionStatus; score: number; startedAt: string; durationMinutes: number; tension: number; confidence: number; crmContext?: string; }
export interface Feedback { id: string; sessionId: string; coachId: string; severity: "low" | "medium" | "high"; note: string; resolved: boolean; }
export interface LeaderboardEntry { id: string; learnerName: string; rank: number; score: number; improvement: number; streak: number; sessionsCompleted: number; team: string; drillType: DrillType; }
export interface FeatureFlag { key: string; label: string; enabled: boolean; description: string; }
export interface PromptVersion { id: string; name: string; model: string; version: number; status: "active" | "testing" | "archived"; costPerSession: number; }
