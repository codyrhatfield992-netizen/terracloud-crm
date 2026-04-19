import { Building2 } from "lucide-react";
import interior1 from "@/assets/sim-interior-1.jpg";
import interior2 from "@/assets/sim-interior-2.jpg";

interface Props {
  imageUrl?: string;
  variant?: "kitchen" | "bedroom";
  height?: string;
  children?: React.ReactNode;
}

export default function SimulationViewport({ imageUrl, variant = "kitchen", height = "h-[420px]", children }: Props) {
  const src = imageUrl ?? (variant === "bedroom" ? interior2 : interior1);

  return (
    <div className={`relative ${height} w-full rounded-xl overflow-hidden xr-hairline xr-scan-line bg-background`}>
      {/* Hero interior backdrop */}
      <img
        src={src}
        alt="Digital twin viewport"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Vignette + grain layers — give it the cinematic depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/40" />
      <div className="absolute inset-0 xr-grid-bg opacity-[0.08] mix-blend-overlay" />

      {!src && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full xr-glass-strong xr-glow">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Digital Twin · Loaded</p>
          </div>
        </div>
      )}

      {/* Corner brackets — silver, restrained */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-foreground/30" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-foreground/30" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-foreground/30" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-foreground/30" />

      {children}
    </div>
  );
}
