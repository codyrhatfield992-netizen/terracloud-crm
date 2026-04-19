import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, Sparkles, Crosshair } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceDot } from "recharts";
import AppLayout from "@/components/AppLayout";
import { getAutopsyById } from "@/data/simulations";
import TrustMeter from "@/components/xr/TrustMeter";

export default function DealAutopsyDetail() {
  const { id } = useParams();
  const a = getAutopsyById(id ?? "");

  if (!a) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-muted-foreground">
          Autopsy not found. <Link to="/deal-autopsy" className="text-primary hover:underline">Back</Link>
        </div>
      </AppLayout>
    );
  }

  const Icon = a.outcome === "closed" ? CheckCircle2 : a.outcome === "lost" ? XCircle : AlertTriangle;
  const outcomeCls = a.outcome === "closed" ? "text-success" : a.outcome === "lost" ? "text-destructive" : "text-warning";

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px]">
        <Link to="/deal-autopsy" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> Back to Autopsies
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className={`flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest mb-2 ${outcomeCls}`}>
              <Icon className="h-3.5 w-3.5" /> Mission · {a.outcome.replace("_", " ")}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{a.scenarioName}</h1>
            <p className="text-sm text-muted-foreground mt-1">{a.clientName} · {a.clientArchetype} · {a.propertyAddress}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Overall Score</p>
            <p className="text-4xl font-mono font-semibold tabular-nums text-foreground">{a.overallScore}<span className="text-base text-muted-foreground">/100</span></p>
          </div>
        </div>

        {/* Breakdown banner */}
        {a.breakdownPoint && (
          <div className="xr-glass-strong rounded-xl p-5 border-l-2 border-destructive">
            <div className="flex items-start gap-3">
              <Crosshair className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-destructive mb-1">Critical Breakdown Point</p>
                <p className="text-base font-semibold text-foreground">{a.breakdownPoint.room} · <span className="font-mono text-muted-foreground">{a.breakdownPoint.minute}</span></p>
                <p className="text-sm text-muted-foreground mt-1.5">{a.breakdownPoint.cause}</p>
              </div>
            </div>
          </div>
        )}

        {/* Trust timeline */}
        <div className="xr-glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Trust Timeline</h2>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Real-time decay analysis</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={a.trustTimeline}>
                <XAxis dataKey="t" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                />
                <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room coverage + scoring */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 xr-glass rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold mb-2">Room-by-Room Coverage</h2>
            {a.rooms.map((room, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{room.name}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-muted-foreground">{room.coverage}%</span>
                    <span className={room.trustDelta >= 0 ? "text-success" : "text-destructive"}>
                      {room.trustDelta > 0 ? "+" : ""}{room.trustDelta}
                    </span>
                  </div>
                </div>
                <TrustMeter value={room.coverage} showValue={false} size="sm" />
                <p className="text-[11px] text-muted-foreground">{room.notes}</p>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="xr-glass rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold mb-2">Performance</h2>
              <TrustMeter value={a.toneScore} label="Tone" />
              <TrustMeter value={a.pacingScore} label="Pacing" />
              <TrustMeter value={a.professionalismScore} label="Professionalism" />
            </div>

            <div className="xr-glass rounded-xl p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-xr-amber mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" /> Missed Objections
              </p>
              {a.missedObjections.length === 0 ? (
                <p className="text-xs text-muted-foreground">None — all objections handled.</p>
              ) : (
                <ul className="space-y-1">
                  {a.missedObjections.map((o, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                      <span className="text-xr-amber mt-0.5">●</span>{o}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="xr-glass rounded-xl p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Missed Opportunities</p>
              <ul className="space-y-1">
                {a.missedOpportunities.map((o, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">◆</span>{o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="xr-glass-strong rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Recommended Repositioning</h2>
          </div>
          <ul className="space-y-2">
            {a.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2.5">
                <span className="font-mono text-[10px] text-primary mt-1 w-4">{String(i + 1).padStart(2, "0")}</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
