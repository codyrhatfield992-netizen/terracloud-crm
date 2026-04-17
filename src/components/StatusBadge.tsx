import { ReactNode } from "react";
import {
  normalizePriority,
  normalizeStage,
  normalizePropertyStatus,
  normalizeContactType,
} from "@/lib/constants";

interface StatusBadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "primary";
  className?: string;
}

const dotColor: Record<string, string> = {
  default: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  outline: "bg-muted-foreground",
  primary: "bg-primary",
};

export default function StatusBadge({ children, variant = "default", className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-muted-foreground border border-border ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor[variant] ?? dotColor.default}`} />
      {children}
    </span>
  );
}

export function priorityVariant(p: string): StatusBadgeProps["variant"] {
  switch (normalizePriority(p)) {
    case "urgent": return "destructive";
    case "high": return "warning";
    case "medium": return "primary";
    default: return "outline";
  }
}

export function stageVariant(s: string): StatusBadgeProps["variant"] {
  switch (normalizeStage(s)) {
    case "closed": return "success";
    case "dead": return "destructive";
    case "contract": return "warning";
    case "offer": return "primary";
    default: return "default";
  }
}

export function propertyStatusVariant(s: string): StatusBadgeProps["variant"] {
  switch (normalizePropertyStatus(s)) {
    case "available": return "success";
    case "under_contract": return "warning";
    case "sold": return "primary";
    case "off_market": return "outline";
    default: return "default";
  }
}

export function contactTypeVariant(t: string): StatusBadgeProps["variant"] {
  switch (normalizeContactType(t)) {
    case "seller": return "primary";
    case "buyer": return "success";
    case "agent": return "warning";
    default: return "outline";
  }
}
