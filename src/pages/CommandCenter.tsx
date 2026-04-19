import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Play, Headset, Monitor, AlertTriangle, CheckCircle2, ChevronRight, Brain, Building2, Crosshair } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useLeads } from "@/hooks/useLeads";
import { useProperties } from "@/hooks/useProperties";
import { useContacts } from "@/hooks/useContacts";
import { getBuyerProfile, getListingIntel, getFitAnalysis, readinessLabel, readinessColor } from "@/lib/intelligence";
import { formatCurrency } from "@/lib/constants";
import TrustMeter from "@/components/xr/TrustMeter";
import ArchetypeBadge from "@/components/xr/ArchetypeBadge";
import FitScore from "@/components/xr/FitScore";
import SimulationViewport from "@/components/xr/SimulationViewport";

export default function CommandCenter() {
  const { data: leads = [] } = useLeads();
  const { data: properties = [] } = useProperties();
  const { data: contacts = [] } = useContacts();

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [mode, setMode] = useState<"vr" | "desktop">("desktop");

  const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId) ?? leads[0], [leads, selectedLeadId]);
  const selectedProperty = useMemo(() => properties.find(p => p.id === selectedPropertyId) ?? properties[0], [properties, selectedPropertyId]);
  const contactName = selectedLead?.contact_id ? contacts.find(c => c.id === selectedLead.contact_id)?.name : undefined;

  const profile = selectedLead ? getBuyerProfile(selectedLead.id) : null;
  const intel = selectedProperty ? getListingIntel(selectedProperty.id) : null;
  const fit = selectedLead && selectedProperty ? getFitAnalysis(selectedLead.id, selectedProperty.id) : null;

  if (leads.length === 0 || properties.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto py-20 text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full xr-glass-strong xr-glow mx-auto">
            <Crosshair className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Command Center</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Pair a lead with a listing to launch a behavioral simulation. Add at least one lead and one property to get started.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/leads" className="h-9 px-4 inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Add Lead</Link>
            <Link to="/properties" className="h-9 px-4 inline-flex items-center gap-2 rounded-md border border-border text-sm hover:bg-card">Add Property</Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Lead-to-Simulation Pairing
            </div>
            <h1 className="text-2xl font-semibold tracking-tight xr-gradient-text">Command Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Select a client and listing. Inspect fit. Launch the simulation.</p>
          </div>
          <div className="flex items-center gap-2 xr-glass rounded-md p-1">
            <button
              onClick={() => setMode("desktop")}
              className={`h-8 px-3 rounded text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 transition ${mode === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </button>
            <button
              onClick={() => setMode("vr")}
              className={`h-8 px-3 rounded text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 transition ${mode === "vr" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Headset className="h-3.5 w-3.5" /> VR
            </button>
          </div>
        </div>

        {/* Three-column command layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Client */}
          <div className="lg:col-span-3 xr-glass rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Client Profile</h2>
              <Brain className="h-3.5 w-3.5 text-primary" />
            </div>
            <select
              value={selectedLead?.id ?? ""}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:border-primary"
            >
              {leads.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>

            {selectedLead && profile && (
              <>
                <div>
                  <p className="text-base font-semibold text-foreground">{selectedLead.title}</p>
                  {contactName && <p className="text-xs text-muted-foreground mt-0.5">{contactName}</p>}
                </div>
                <ArchetypeBadge archetypeId={profile.archetype.id} size="md" />
                <p className="text-xs text-muted-foreground leading-relaxed">{profile.archetype.description}</p>

                <div className="space-y-2.5 pt-2 border-t border-border">
                  <TrustMeter value={profile.trustLevel} label="Trust" size="sm" />
                  <TrustMeter value={profile.urgency} label="Urgency" size="sm" />
                  <TrustMeter value={profile.emotionalReactivity} label="Reactivity" size="sm" />
                  <TrustMeter value={profile.decisionSpeed} label="Decision Speed" size="sm" />
                </div>

                <div className="pt-2 border-t border-border space-y-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Trust Signature</p>
                  <p className="text-sm font-mono text-primary">{profile.trustSignature}</p>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Likely Objections</p>
                  <ul className="space-y-1">
                    {profile.objections.slice(0, 3).map((o, i) => (
                      <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                        <span className="text-xr-amber mt-0.5">●</span>{o}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Viewport */}
          <div className="lg:col-span-6 space-y-4">
            <SimulationViewport>
              {selectedProperty && intel && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 xr-glass-strong rounded-lg px-5 py-3 flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Listing</p>
                    <p className="text-sm font-medium text-foreground">{selectedProperty.address}</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Twin</p>
                    <p className={`text-sm font-mono uppercase ${intel.digitalTwinStatus === "ready" ? "text-success" : intel.digitalTwinStatus === "scanning" ? "text-warning" : "text-muted-foreground"}`}>
                      {intel.digitalTwinStatus}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Readiness</p>
                    <p className="text-sm font-mono text-primary tabular-nums">{intel.simulationReadiness}%</p>
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4 xr-glass rounded px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary xr-live-dot" />
                Pre-flight · Stand-by
              </div>
            </SimulationViewport>

            {/* Fit panel */}
            {fit && (
              <div className="xr-glass rounded-xl p-5">
                <div className="flex items-center gap-6">
                  <FitScore score={fit.fitScore} label="Fit" size="lg" />
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Trust Forecast</p>
                      <TrustMeter value={fit.trustForecast} showValue size="md" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Close Probability</p>
                      <TrustMeter value={fit.closeProbability} showValue size="md" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 mt-5 pt-5 border-t border-border">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-success mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3" /> Match Reasons
                    </p>
                    <ul className="space-y-1.5">
                      {fit.matchReasons.map((r, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-2">
                          <span className="text-success mt-1">▸</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-xr-amber mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-3 w-3" /> Risk Flags
                    </p>
                    <ul className="space-y-1.5">
                      {fit.riskFlags.map((r, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-2">
                          <span className="text-xr-amber mt-1">▸</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Listing + Launch */}
          <div className="lg:col-span-3 space-y-4">
            <div className="xr-glass rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Listing</h2>
                <Building2 className="h-3.5 w-3.5 text-primary" />
              </div>
              <select
                value={selectedProperty?.id ?? ""}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm focus:outline-none focus:border-primary"
              >
                {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
              </select>

              {selectedProperty && intel && (
                <>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedProperty.address}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedProperty.city}, {selectedProperty.state}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="xr-glass rounded p-2">
                      <p className="font-mono text-foreground">{selectedProperty.beds || "—"}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">Beds</p>
                    </div>
                    <div className="xr-glass rounded p-2">
                      <p className="font-mono text-foreground">{selectedProperty.baths || "—"}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">Baths</p>
                    </div>
                    <div className="xr-glass rounded p-2">
                      <p className="font-mono text-foreground">{selectedProperty.sqft ? `${(selectedProperty.sqft/1000).toFixed(1)}k` : "—"}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">SqFt</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(Number(selectedProperty.arv))}</p>

                  <div className="pt-2 border-t border-border">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Objection Hotspots</p>
                    <ul className="space-y-1">
                      {intel.hotspots.slice(0, 3).map((h, i) => (
                        <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">◆</span>{h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Launch */}
            <div className="xr-glass-strong rounded-xl p-5 space-y-4 xr-glow">
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-primary">Launch Sequence</p>
                {profile && (
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${readinessColor(profile.simulationReadiness)} ${profile.simulationReadiness === "ready" ? "xr-live-dot" : ""}`} />
                    <span className="text-sm font-medium text-foreground">{readinessLabel(profile.simulationReadiness)}</span>
                  </div>
                )}
              </div>
              <Link
                to="/simulations/sim_01"
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-md bg-gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition shadow-glow"
              >
                <Play className="h-4 w-4 fill-current" /> Launch Simulation
                <ChevronRight className="h-4 w-4" />
              </Link>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center">
                {mode === "vr" ? "Headset ready · Hand-track + Voice" : "Desktop · WASD + Eye-focus"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
