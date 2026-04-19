import { Headset, Monitor } from "lucide-react";

interface Props {
  mode: "vr" | "desktop";
  size?: "xs" | "sm";
}

export default function XRModeBadge({ mode, size = "sm" }: Props) {
  const Icon = mode === "vr" ? Headset : Monitor;
  const label = mode === "vr" ? "VR" : "Desktop";
  const cls =
    mode === "vr"
      ? "text-xr-violet bg-xr-violet/10 border-xr-violet/30"
      : "text-xr-cyan bg-xr-cyan/10 border-xr-cyan/30";
  const px = size === "xs" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border font-mono uppercase tracking-widest ${px} ${cls}`}>
      <Icon className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {label}
    </span>
  );
}
