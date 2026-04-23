import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Play, Radio } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { EmptyPanel, ErrorState, LoadingState, PageHeader } from "@/components/training/SaaSPrimitives";
import { trainingService } from "@/services/trainingService";
import { useTrainingQuery } from "@/hooks/useTraining";
import type { Difficulty, DrillType, PracticeMode, ScenarioSource } from "@/types/training";

const drills: DrillType[] = ["discovery", "objection_handling", "closing", "cold_call", "listing_presentation", "buyer_consult"];
const sources: ScenarioSource[] = ["generic", "crm_lead", "crm_contact", "listing"];
const difficulties: Difficulty[] = ["easy", "medium", "hard", "elite"];

export default function PracticeLauncher() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useTrainingQuery(() => trainingService.getLauncherOptions(), []);
  const [drillType, setDrillType] = useState<DrillType>("buyer_consult");
  const [source, setSource] = useState<ScenarioSource>("crm_lead");
  const [mode, setMode] = useState<PracticeMode>("text");
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const preview = useTrainingQuery(() => trainingService.previewScenario({ drillType, source, difficulty }), [drillType, source, difficulty]);

  const sourceCount = useMemo(() => source === "crm_lead" ? data?.crmLeads.length : source === "crm_contact" ? data?.crmContacts.length : source === "listing" ? data?.crmListings.length : data?.scenarios.length, [data, source]);
  if (isLoading) return <AppLayout><LoadingState /></AppLayout>;
  if (error || !data) return <AppLayout><ErrorState /></AppLayout>;

  return <AppLayout><div className="space-y-6 max-w-[1500px]"><PageHeader eyebrow="Practice Launcher" title="Build a Simulation" description="Compose a text-first AI practice session from generic scenarios, CRM leads, contacts, or listings. Voice and hybrid modes are scaffolded for realtime expansion." />
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <div className="xl:col-span-7 space-y-5">
        <Selector title="Drill type" values={drills} value={drillType} onChange={setDrillType} />
        <Selector title="Scenario source" values={sources} value={source} onChange={setSource} />
        <div className="xr-glass rounded-xl p-5"><p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Mode</p><div className="grid grid-cols-3 gap-3">{(["text", "voice", "hybrid"] as PracticeMode[]).map((m) => <button key={m} onClick={() => m === "text" && setMode(m)} className={`rounded-lg border border-border p-4 text-left transition ${mode === m ? "bg-primary text-primary-foreground" : "xr-glass hover:border-primary/40"}`}><div className="flex items-center justify-between"><Radio className="h-4 w-4" />{m !== "text" && <span className="text-[9px] font-mono uppercase tracking-widest inline-flex items-center gap-1"><Lock className="h-3 w-3" /> soon</span>}</div><p className="text-sm font-semibold mt-3 capitalize">{m}</p></button>)}</div></div>
        <Selector title="Difficulty" values={difficulties} value={difficulty} onChange={setDifficulty} />
      </div>
      <div className="xl:col-span-5 space-y-5">
        <div className="xr-glass-strong rounded-xl p-5 min-h-[420px]"><div className="flex items-center justify-between mb-4"><h2 className="text-sm font-semibold">Scenario Preview</h2><span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{sourceCount} sources</span></div>{preview.isLoading || !preview.data ? <EmptyPanel title="Compiling preview" description="The scenario contract is being prepared." /> : <div className="space-y-4"><div><p className="text-xl font-semibold text-foreground">{preview.data.title}</p><p className="text-sm text-muted-foreground mt-2">{preview.data.summary}</p></div><div className="grid grid-cols-2 gap-3">{Object.entries(preview.data.structuredOutput).map(([k, v]) => <div key={k} className="xr-glass rounded-lg p-3"><p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{k.replace(/_/g, " ")}</p><p className="text-sm text-foreground mt-1">{Array.isArray(v) ? v.join(", ") : String(v)}</p></div>)}</div><div><p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Goals</p><ul className="space-y-1.5">{preview.data.goals.map((g) => <li key={g} className="text-sm text-foreground flex gap-2"><span className="text-primary">◆</span>{g}</li>)}</ul></div></div>}</div>
        <button onClick={async () => { const session = await trainingService.createSession({ scenarioId: preview.data?.id ?? "scn-1", mode, difficulty }); navigate(`/practice/live/${session.id}`); }} className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium inline-flex items-center justify-center gap-2 hover:bg-primary/90"><Play className="h-4 w-4" /> Start Session</button>
      </div>
    </div>
  </div></AppLayout>;
}
function Selector<T extends string>({ title, values, value, onChange }: { title: string; values: readonly T[]; value: T; onChange: React.Dispatch<React.SetStateAction<T>> }) { return <div className="xr-glass rounded-xl p-5"><p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">{title}</p><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{values.map((v) => <button key={v} onClick={() => onChange(v)} className={`rounded-lg border border-border px-3 py-3 text-sm capitalize text-left transition ${value === v ? "bg-primary text-primary-foreground" : "bg-card hover:border-primary/40 text-foreground"}`}>{v.replace(/_/g, " ")}</button>)}</div></div>; }
