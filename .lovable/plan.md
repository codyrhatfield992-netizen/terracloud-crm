

## TerraCloud → TerraCloud XR Transformation Plan

### Strategy
This is a **demo-focused product evolution** for a pitch. The goal is a polished, believable XR-driven CRM — not a fully-wired simulation engine. Real CRM data (leads/properties/contacts) stays connected to Supabase. New "intelligence" fields (behavioral profile, simulation scores, trust signatures) live as **derived/synthetic data** layered on top of existing records, so the product looks alive without breaking what works.

### What changes

**1. Brand & shell redesign**
- Rename app to **TerraCloud XR**. New wordmark with subtle glow.
- Sidebar: regrouped into 3 sections — *Workspace* (Dashboard, Leads, Properties, Contacts), *Simulation* (Command Center, Simulations, Deal Autopsy), *Intelligence* (Analytics, Tasks, Meetings, Documents). Premium icons + section labels.
- New design tokens: deep graphite (`#0A0A0A` / `#0F1115`), cool steel-blue accent (`#3B82F6` → `#60A5FA` gradient), silver glass borders, subtle radial-glow backdrops on key panels, hairline dividers. Adds depth without leaving the dark/minimal language already in place.
- Topbar: status pill ("XR Mode: Desktop" / "VR Ready"), command-K search, presence dot.

**2. New Pages (4)**
- `/command-center` — flagship lead-to-simulation pairing screen (3 columns: Client Profile · Listing · Simulation Preview + Launch panel with fit score, objection hotspots, trust forecast).
- `/simulations` — active + recent simulation runs grid with status, scores, paired client/listing, XR/Desktop badges.
- `/simulations/:id` — live simulation viewport mock (cinematic still + HUD overlays: walkthrough %, trust meter, objection signals, controls hint).
- `/deal-autopsy` and `/deal-autopsy/:id` — post-mission breakdown: critical breakdown point, trust decline chart, objection handling score, room coverage 3D-style diagram, recommendations.

**3. Evolved existing pages**
- **Leads** → "Buyer Intelligence". Each lead card gets archetype badge (Luxury Buyer / Skeptical Investor / etc.), trust meter, simulation-readiness dot.
- **Lead detail** → tabs: *Overview · Behavior Model · Objections · Activity · Simulations*. Adds personality archetype, communication style, emotional tendencies, trust/risk/urgency meters, "Launch Simulation" CTA.
- **Properties** → premium image-forward grid; each card shows digital-twin status, simulation-readiness, walkthrough complexity. Detail page adds buyer-fit panel and objection-hotspot map.
- **Dashboard** → reframed as "Mission Control": simulation activity feed, top archetype performance, close probability gauge, recent autopsy summary, alongside existing pipeline/tasks.
- **Analytics** (new page) → archetype performance, trust breakdown patterns, objection categories, simulation runs over time.

**4. Mock intelligence layer**
- New `src/lib/intelligence.ts` — deterministic generators that derive archetype, trust score, objections, fit score from a lead's `id` (so values are stable across renders). Real CRM data stays the source of truth for name/budget/etc.
- New `src/data/simulations.ts` — 12+ believable simulation runs and 6+ deal autopsies as mock data (since these aren't in the DB). Stored in-memory; pitch-ready immediately, no migrations needed.
- Seed-on-first-login helper: if a new user's account has zero leads/properties, auto-insert ~10 rich demo leads and ~10 demo properties into Supabase so the product looks alive on day one. (Optional toggle in Settings: "Reset demo data".)

**5. XR access language**
- Subtle "XR Mode" toggle in topbar (Desktop ↔ VR), keyboard-controls hint chip on simulation screens, VR-ready badges on properties — communicated through iconography, not paragraphs.

### Files (high-level)
- **New:** `src/pages/CommandCenter.tsx`, `Simulations.tsx`, `SimulationDetail.tsx`, `DealAutopsy.tsx`, `DealAutopsyDetail.tsx`, `Analytics.tsx`; `src/lib/intelligence.ts`; `src/data/simulations.ts`; `src/lib/seedDemoData.ts`; `src/components/xr/` (TrustMeter, ArchetypeBadge, FitScore, ObjectionHotspots, SimulationViewport, HUDOverlay, XRModeBadge).
- **Refactor:** `AppSidebar`, `TopBar`, `index.css` (new tokens + subtle glow utilities), `Dashboard`, `Leads`, `LeadDetail`, `Properties`, `PropertyDetail`, `App.tsx` (new routes), `constants.ts` (archetypes, simulation statuses).
- **No DB migrations** — intelligence layer is derived; simulations/autopsies are mock for the demo.

### Out of scope (for this pass)
- Real 3D/WebXR runtime (use cinematic stills + HUD overlays as the "simulation viewport").
- Persisting simulations/autopsies to Supabase (can come later if you want users to actually run sims).
- Reworking auth, Tasks, Meetings, Documents internals — they get the new visual skin only.

