import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, DollarSign, Trash2, Phone, Mail, MessageSquare, Calendar, FileText,
  Brain, Target, AlertTriangle, Sparkles, Play, ChevronRight, Clock, Crosshair,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { priorityVariant } from "@/components/StatusBadge";
import { useLead, useUpdateLead, useDeleteLead } from "@/hooks/useLeads";
import { useContact } from "@/hooks/useContacts";
import { useProperty } from "@/hooks/useProperties";
import {
  PIPELINE_STAGES,
  PRIORITIES,
  formatCurrency,
  formatDate,
  getPriorityLabel,
  normalizePriority,
  normalizeStage,
  timeAgo,
} from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { getBuyerProfile, getLeadActivity, getDeepProfile, type ActivityItem } from "@/lib/intelligence";
import ArchetypeBadge from "@/components/xr/ArchetypeBadge";
import TrustMeter from "@/components/xr/TrustMeter";

type Tab = "overview" | "behavior" | "objections" | "activity" | "simulations";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "behavior", label: "Behavior Model" },
  { id: "objections", label: "Objections" },
  { id: "activity", label: "Activity" },
  { id: "simulations", label: "Simulations" },
];

const ACTIVITY_ICON: Record<ActivityItem["type"], typeof Phone> = {
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  meeting: Calendar,
  note: FileText,
};

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: lead, isLoading } = useLead(id);
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const { data: contact } = useContact(lead?.contact_id || undefined);
  const { data: property } = useProperty(lead?.property_id || undefined);
  const [showDelete, setShowDelete] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-[1200px]">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[480px] rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!lead) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground mb-4">Lead not found</p>
          <Link to="/leads" className="text-sm text-primary hover:underline">Back to Leads</Link>
        </div>
      </AppLayout>
    );
  }

  const stage = normalizeStage(lead.stage);
  const priority = normalizePriority(lead.priority);
  const profile = getBuyerProfile(lead.id);
  const deep = getDeepProfile(lead.id, Number(lead.estimated_value) || 0);
  const activity = getLeadActivity(lead.id);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1280px]">
        <Link to="/leads" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Buyer Intelligence
        </Link>

        {/* Header — premium, dense */}
        <div className="xr-glass-strong rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 xr-radial-glow pointer-events-none" />
          <div className="relative flex items-start justify-between gap-6 flex-wrap">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                <Brain className="h-3 w-3" />
                Buyer Intelligence Profile
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{lead.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <ArchetypeBadge archetypeId={profile.archetype.id} size="md" />
                <span className="text-xs font-mono text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{profile.commStyle} · {profile.trustSignature}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={stage}
                onChange={(e) => updateLead.mutate({ id: lead.id, stage: e.target.value })}
                disabled={updateLead.isPending}
                className="h-9 px-3 rounded-md xr-glass border border-border text-xs text-foreground focus:outline-none focus:border-foreground/40 disabled:opacity-60"
              >
                {PIPELINE_STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <select
                value={priority}
                onChange={(e) => updateLead.mutate({ id: lead.id, priority: e.target.value })}
                disabled={updateLead.isPending}
                className="h-9 px-3 rounded-md xr-glass border border-border text-xs text-foreground focus:outline-none focus:border-foreground/40 disabled:opacity-60"
              >
                {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <Link
                to="/command-center"
                className="h-9 px-4 inline-flex items-center gap-2 rounded-md bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition shadow-glow"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Launch Simulation
              </Link>
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="relative grid grid-cols-2 md:grid-cols-5 gap-px mt-6 bg-border rounded-lg overflow-hidden">
            <Stat label="Budget" value={formatCurrency(deep.budgetCeiling)} mono />
            <Stat label="Timeline" value={deep.timeline.split(" · ")[0]} sub={deep.timeline.split(" · ")[1]} />
            <Stat label="Motivation" value={`${deep.motivationScore}`} sub="/ 100" mono />
            <Stat label="Trust Level" value={`${profile.trustLevel}`} sub="/ 100" mono />
            <Stat label="Conversations" value={`${deep.pastConversations}`} sub="logged" mono />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 h-10 text-sm font-medium transition relative ${
                tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />}
            </button>
          ))}
          <div className="ml-auto pr-1">
            <button
              onClick={() => setShowDelete(true)}
              className="h-9 px-3 flex items-center gap-1.5 text-xs text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-md transition"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* Tab content */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <Section title="Motivation & Context">
                <Row label="Why now">{deep.motivation}</Row>
                <Row label="Family">{deep.family}</Row>
                <Row label="Desired type">{deep.desiredType}</Row>
                <Row label="Source">{lead.source || "—"}</Row>
                <Row label="Est. Deal Value" icon={<DollarSign className="h-3 w-3" />}>
                  {formatCurrency(Number(lead.estimated_value))}
                </Row>
                <Row label="Created">{formatDate(lead.created_at)}</Row>
              </Section>

              {(contact || property) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contact && (
                    <Link to={`/contacts/${contact.id}`} className="xr-glass rounded-xl p-4 block hover:border-foreground/30 transition">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Linked Contact</p>
                      <p className="text-sm font-semibold text-foreground">{contact.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{contact.email || "—"} · {contact.phone || "—"}</p>
                    </Link>
                  )}
                  {property && (
                    <Link to={`/properties/${property.id}`} className="xr-glass rounded-xl p-4 block hover:border-foreground/30 transition">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Recommended Fit</p>
                      <p className="text-sm font-semibold text-foreground">{property.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {property.city}, {property.state} · {formatCurrency(Number(property.arv))}
                      </p>
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="xr-glass rounded-xl p-5 space-y-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Trust Signature</p>
                <p className="text-lg font-mono text-foreground">{profile.trustSignature}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{profile.archetype.description}</p>
              </div>
              <div className="xr-glass rounded-xl p-5 space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Live Meters</p>
                <TrustMeter value={profile.trustLevel} label="Trust" size="sm" />
                <TrustMeter value={profile.urgency} label="Urgency" size="sm" />
                <TrustMeter value={profile.riskLevel} label="Risk" size="sm" />
                <TrustMeter value={deep.motivationScore} label="Motivation" size="sm" />
              </div>
            </div>
          </div>
        )}

        {tab === "behavior" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 xr-glass rounded-xl p-6 space-y-6">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Personality Archetype</p>
                <h2 className="text-xl font-semibold">{profile.archetype.label}</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{profile.archetype.description}</p>
              </div>
              <div className="xr-divider" />
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                <TrustMeter value={profile.trustLevel} label="Trust Level" />
                <TrustMeter value={profile.urgency} label="Urgency" />
                <TrustMeter value={profile.riskLevel} label="Risk Level" />
                <TrustMeter value={profile.emotionalReactivity} label="Emotional Reactivity" />
                <TrustMeter value={profile.decisionSpeed} label="Decision Speed" />
                <TrustMeter value={deep.motivationScore} label="Motivation Score" />
              </div>
            </div>
            <div className="space-y-5">
              <div className="xr-glass rounded-xl p-5 space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Communication Style</p>
                <p className="text-lg font-semibold text-foreground">{profile.commStyle}</p>
                <p className="text-xs text-muted-foreground">Mirror this tone for first 5 minutes to establish rapport.</p>
              </div>
              <div className="xr-glass rounded-xl p-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Trust Signature</p>
                <div className="text-2xl font-mono text-foreground">{profile.trustSignature}</div>
              </div>
            </div>
          </div>
        )}

        {tab === "objections" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="xr-glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-xr-amber" />
                <h2 className="text-sm font-semibold">Likely Objections</h2>
              </div>
              <ul className="space-y-3">
                {profile.objections.map((o, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-md bg-secondary/50 border border-border">
                    <span className="font-mono text-[10px] text-xr-amber mt-1 w-5">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm text-foreground">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="xr-glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-foreground" />
                <h2 className="text-sm font-semibold">Pre-emptive Plays</h2>
              </div>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-foreground/60">▸</span> Lead with the strongest match reason — anchor positive frame.</li>
                <li className="flex gap-2"><span className="text-foreground/60">▸</span> Pre-load comp data within 8% of asking before tour.</li>
                <li className="flex gap-2"><span className="text-foreground/60">▸</span> Acknowledge the top objection in opening 90 seconds.</li>
                <li className="flex gap-2"><span className="text-foreground/60">▸</span> Reserve a story for each marquee room — never sell on specs alone.</li>
              </ul>
            </div>
          </div>
        )}

        {tab === "activity" && (
          <div className="xr-glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold">Activity Timeline</h2>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{activity.length} events</span>
            </div>
            <div className="relative space-y-4">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
              {activity.map((a, i) => {
                const Icon = ACTIVITY_ICON[a.type];
                return (
                  <div key={i} className="relative flex items-start gap-4 pl-1">
                    <div className="relative z-10 h-7 w-7 shrink-0 rounded-md xr-glass-strong flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 pb-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">{a.title}</p>
                        <span className="text-[10px] font-mono text-muted-foreground shrink-0 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {timeAgo(a.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{a.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "simulations" && (
          <div className="xr-glass-strong rounded-xl p-8 text-center space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full xr-glass xr-glow mx-auto">
              <Crosshair className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">No simulations run yet</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Pair this client with a listing in the Command Center to launch a behavioral rehearsal.
              </p>
            </div>
            <Link
              to="/command-center"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition shadow-glow"
            >
              <Play className="h-4 w-4 fill-current" /> Launch Simulation
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowDelete(false)} />
          <div className="relative xr-glass-strong rounded-lg p-6 max-w-md w-full mx-4 shadow-elevated animate-scale-in">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Lead</h3>
            <p className="text-sm text-muted-foreground mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDelete(false)} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button
                onClick={() => deleteLead.mutate(lead.id, { onSuccess: () => navigate("/leads") })}
                disabled={deleteLead.isPending}
                className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 disabled:opacity-60"
              >
                {deleteLead.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function Stat({ label, value, sub, mono }: { label: string; value: string; sub?: string; mono?: boolean }) {
  return (
    <div className="bg-card p-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`text-lg ${mono ? "font-mono" : "font-semibold"} text-foreground mt-1 tabular-nums`}>
        {value}
        {sub && <span className="text-xs text-muted-foreground ml-1 font-normal">{sub}</span>}
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="xr-glass rounded-xl p-6">
      <h2 className="text-sm font-semibold text-foreground mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">{icon}{label}</span>
      <span className="text-sm text-foreground text-right">{children}</span>
    </div>
  );
}
