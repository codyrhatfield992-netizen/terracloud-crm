import { ReactNode } from "react";

interface StatusBadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "primary";
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
  outline: "border border-border text-muted-foreground",
  primary: "bg-primary/15 text-primary",
};

export default function StatusBadge({ children, variant = "default", className = "" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function priorityVariant(p: string): StatusBadgeProps["variant"] {
  switch (p) {
    case "Urgent": return "destructive";
    case "High": return "warning";
    case "Medium": return "primary";
    default: return "outline";
  }
}

export function stageVariant(s: string): StatusBadgeProps["variant"] {
  switch (s) {
    case "closed": return "success";
    case "dead": return "destructive";
    case "contract": return "warning";
    case "offer": return "primary";
    default: return "default";
  }
}

export function propertyStatusVariant(s: string): StatusBadgeProps["variant"] {
  switch (s) {
    case "Available": return "success";
    case "Under Contract": return "warning";
    case "Sold": return "primary";
    case "Off Market": return "outline";
    default: return "default";
  }
}
