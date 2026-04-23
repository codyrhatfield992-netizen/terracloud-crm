import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MicOff, Pause, Play, Send, Square } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { ErrorState, LoadingState, PageHeader, TranscriptPane } from "@/components/training/SaaSPrimitives";
import TrustMeter from "@/components/xr/TrustMeter";
import { trainingService } from "@/services/trainingService";
import { useTrainingQuery } from "@/hooks/useTraining";

export default function LivePracticeSession() {
  const { id = "sess-live" } = useParams();
  const [state, setState] = useState<"live" | "paused">("live");
  const [input, setInput] = useState("");
  const session = useTrainingQuery(() => trainingService.getSession(id), [id]);
  const turns = useTrainingQuery(() => trainingService.getSessionTurns(id), [id]);
  if (session.isLoading || turns.isLoading) return <AppLayout><LoadingState /></AppLayout>;
  if (session.error || !session.data || turns.error || !turns.data) return <AppLayout><ErrorState /></AppLayout>;

  return <AppLayout><div className="space-y-5 max-w-[1600px]"><PageHeader eyebrow="Live Practice Session" title={session.data.scenarioTitle} description="Text-first practice runtime with streaming-ready transcript, persona state, session goals, and scoring rubric." action={<Link to={`/practice/results/${session.data.id}`} className="h-10 px-4 rounded-md border border-border text-sm inline-flex items-center gap-2 hover:bg-accent"><Square className="h-4 w-4" /> End Session</Link>} />
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <aside className="xl:col-span-3 space-y-5"><div className="xr-glass rounded-xl p-5"><p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Persona</p><h2 className="text-xl font-semibold mt-2">{session.data.crmContext ?? "Generic Prospect"}</h2><p className="text-sm text-muted-foreground mt-2">Guarded, analytical, willing to engage if the learner proves context before pitching.</p><div className="mt-4 space-y-3"><TrustMeter value={session.data.tension} label="Tension" /><TrustMeter value={session.data.confidence} label="Learner confidence" /></div></div><div className="xr-glass rounded-xl p-5 space-y-3"><Control label="Pause" icon={<Pause className="h-4 w-4" />} onClick={() => setState("paused")} /><Control label="Resume" icon={<Play className="h-4 w-4" />} onClick={() => setState("live")} /><Control label="Mute mic placeholder" icon={<MicOff className="h-4 w-4" />} /><div className="pt-3 border-t border-border"><p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">State</p><p className={`text-sm font-mono uppercase mt-1 ${state === "live" ? "text-success" : "text-warning"}`}>{state}</p></div></div></aside>
      <main className="xl:col-span-6 space-y-4"><TranscriptPane turns={turns.data} /><div className="xr-glass rounded-xl p-3 flex items-center gap-3"><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your response to the buyer persona…" className="flex-1 h-10 bg-secondary border border-border rounded-md px-3 text-sm focus:outline-none focus:border-primary" /><button onClick={() => setInput("")} className="h-10 px-4 rounded-md bg-primary text-primary-foreground inline-flex items-center gap-2 text-sm"><Send className="h-4 w-4" /> Send</button></div></main>
      <aside className="xl:col-span-3 space-y-5"><Panel title="Session Goals" items={["Surface the hidden objection", "Earn permission before reframing", "Secure one micro-commitment"]} /><Panel title="Rubric Categories" items={["Discovery depth · 25%", "Trust control · 25%", "Repositioning · 25%", "Close discipline · 25%"]} /><div className="xr-glass rounded-xl p-5"><p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Progress / Tension</p><TrustMeter value={session.data.tension} label="Tension meter" /><p className="text-xs text-muted-foreground mt-4">Hints are available but logged for scoring integrity.</p></div></aside>
    </div>
  </div></AppLayout>;
}
function Control({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick?: () => void }) { return <button onClick={onClick} className="w-full h-9 px-3 rounded-md xr-glass text-sm flex items-center gap-2 hover:border-primary/40">{icon}{label}</button>; }
function Panel({ title, items }: { title: string; items: string[] }) { return <div className="xr-glass rounded-xl p-5"><h2 className="text-sm font-semibold mb-3">{title}</h2><ul className="space-y-2">{items.map((i) => <li key={i} className="text-sm text-foreground flex gap-2"><span className="text-primary">◆</span>{i}</li>)}</ul></div>; }
