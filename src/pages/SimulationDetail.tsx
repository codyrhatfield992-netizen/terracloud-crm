import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Pause, RotateCcw, FileSearch } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { getSimulationById } from "@/data/simulations";
import { ARCHETYPES } from "@/lib/intelligence";
import SimulationViewport from "@/components/xr/SimulationViewport";
import HUDOverlay from "@/components/xr/HUDOverlay";
import XRModeBadge from "@/components/xr/XRModeBadge";
import TrustMeter from "@/components/xr/TrustMeter";

export default function SimulationDetail() {
  const { id } = useParams();
  const sim = getSimulationById(id ?? "");

  if (!sim) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-muted-foreground">
          Simulation not found. <Link to="/simulations" className="text-primary hover:underline">Back</Link>
        </div>
      </AppLayout>
    );
  }

  const archetype = ARCHETYPES.find(a => a.label === sim.clientArchetype) ?? ARCHETYPES[0];

  return (
    <AppLayout>
      <div className="space-y-5 max-w-[1400px]">
        <Link to="/simulations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> Back to Simulations
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-primary mb-1.5">
              {sim.status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-success xr-live-dot" />}
              {sim.status}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{sim.scenarioName}</h1>
            <p className="text-sm text-muted-foreground mt-1">{sim.clientName} · {sim.propertyAddress}</p>
          </div>
          <div className="flex items-center gap-2">
            <XRModeBadge mode={sim.mode} />
            <button className="h-9 px-3 rounded-md xr-glass text-sm flex items-center gap-1.5 hover:bg-card transition">
              <Pause className="h-3.5 w-3.5" /> Pause
            </button>
            <button className="h-9 px-3 rounded-md xr-glass text-sm flex items-center gap-1.5 hover:bg-card transition">
              <RotateCcw className="h-3.5 w-3.5" /> Restart
            </button>
            <Link to="/deal-autopsy" className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm flex items-center gap-1.5 hover:bg-primary/90 transition">
              <FileSearch className="h-3.5 w-3.5" /> View Autopsy
            </Link>
          </div>
        </div>

        {/* Viewport */}
        <SimulationViewport height="h-[520px]" variant={sim.id.charCodeAt(sim.id.length - 1) % 2 === 0 ? "bedroom" : "kitchen"}>
          <HUDOverlay
            walkthroughCoverage={sim.walkthroughCoverage}
            trust={sim.trustEnd || 60}
            objectionsHit={sim.objectionsHit}
            objectionsHandled={sim.objectionsHandled}
            duration={sim.duration}
            mode={sim.mode}
          />
        </SimulationViewport>

        {/* Telemetry strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Telemetry label="Overall Score" value={sim.score} tone="primary" />
          <Telemetry label="Trust End" value={sim.trustEnd} tone="success" />
          <Telemetry label="Walkthrough" value={sim.walkthroughCoverage} suffix="%" tone="cyan" />
          <Telemetry label="Objections" value={sim.objectionsHandled} max={sim.objectionsHit} tone="amber" />
        </div>

        {/* Behavior model */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 xr-glass rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold">Behavior Model · {archetype.label}</h2>
            <p className="text-sm text-muted-foreground">{archetype.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <TrustMeter value={70} label="Composure" />
              <TrustMeter value={55} label="Engagement" />
              <TrustMeter value={42} label="Pressure" />
              <TrustMeter value={88} label="Skepticism" />
            </div>
          </div>
          <div className="xr-glass rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold">XR Controls</h2>
            <ul className="space-y-2 text-xs text-muted-foreground font-mono">
              <li className="flex justify-between"><span>Move</span><span className="text-foreground">WASD / Joystick</span></li>
              <li className="flex justify-between"><span>Look</span><span className="text-foreground">Mouse / Headset</span></li>
              <li className="flex justify-between"><span>Focus</span><span className="text-foreground">Eye-track / Trigger</span></li>
              <li className="flex justify-between"><span>Speak</span><span className="text-foreground">Voice / Push-to-talk</span></li>
              <li className="flex justify-between"><span>Pause</span><span className="text-foreground">Esc / Menu</span></li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Telemetry({ label, value, suffix = "", max, tone }: { label: string; value: number; suffix?: string; max?: number; tone: "primary" | "success" | "cyan" | "amber" }) {
  const cls = tone === "success" ? "text-success" : tone === "cyan" ? "text-xr-cyan" : tone === "amber" ? "text-xr-amber" : "text-primary";
  return (
    <div className="xr-glass rounded-xl p-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className={`text-2xl font-mono font-semibold tabular-nums ${cls}`}>
        {value}{suffix}
        {max !== undefined && <span className="text-sm text-muted-foreground"> / {max}</span>}
      </p>
    </div>
  );
}
