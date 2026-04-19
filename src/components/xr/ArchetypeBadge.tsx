import { Brain } from "lucide-react";
import { ARCHETYPES, archetypeColorClass, type ArchetypeId } from "@/lib/intelligence";

interface Props {
  archetypeId: ArchetypeId | string;
  size?: "sm" | "md";
}

export default function ArchetypeBadge({ archetypeId, size = "sm" }: Props) {
  const archetype = ARCHETYPES.find(a => a.id === archetypeId) ?? ARCHETYPES[0];
  const colorCls = archetypeColorClass(archetype.id);
  const px = size === "md" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border font-medium tracking-wide uppercase ${px} ${colorCls}`}>
      <Brain className="h-3 w-3" strokeWidth={2} />
      {archetype.label}
    </span>
  );
}
