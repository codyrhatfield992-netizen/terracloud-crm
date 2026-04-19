import { Building2 } from "lucide-react";

interface Props {
  imageUrl?: string;
  height?: string;
  children?: React.ReactNode;
}

export default function SimulationViewport({ imageUrl, height = "h-[420px]", children }: Props) {
  return (
    <div className={`relative ${height} w-full rounded-xl overflow-hidden xr-hairline xr-scan-line bg-background`}>
      {/* Cinematic backdrop */}
      <div className="absolute inset-0 xr-grid-bg opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-xr-violet/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      {imageUrl ? (
        <img src={imageUrl} alt="Simulation viewport" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full xr-glass-strong xr-glow">
              <Building2 className="h-10 w-10 text-primary/60" />
            </div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Digital Twin · Loaded</p>
          </div>
        </div>
      )}

      {/* Corner brackets — cinematic frame */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-primary/60" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-primary/60" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-primary/60" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-primary/60" />

      {children}
    </div>
  );
}
