import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, Contact2, CheckSquare, Calendar, FileText,
  Settings, Crosshair, Sparkles, FileSearch, TrendingUp,
} from "lucide-react";

type NavItem = { label: string; path: string; icon: typeof LayoutDashboard };

const SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { label: "Mission Control", path: "/dashboard", icon: LayoutDashboard },
      { label: "Buyer Intelligence", path: "/leads", icon: Users },
      { label: "Properties", path: "/properties", icon: Building2 },
      { label: "Contacts", path: "/contacts", icon: Contact2 },
    ],
  },
  {
    label: "Simulation",
    items: [
      { label: "Command Center", path: "/command-center", icon: Crosshair },
      { label: "Simulations", path: "/simulations", icon: Sparkles },
      { label: "Deal Autopsy", path: "/deal-autopsy", icon: FileSearch },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Analytics", path: "/analytics", icon: TrendingUp },
      { label: "Tasks", path: "/tasks", icon: CheckSquare },
      { label: "Meetings", path: "/meetings", icon: Calendar },
      { label: "Documents", path: "/documents", icon: FileText },
    ],
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const isActive = (p: string) => location.pathname === p || location.pathname.startsWith(p + "/");

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="relative h-7 w-7 rounded-md bg-gradient-primary flex items-center justify-center xr-glow-soft">
            <span className="text-[10px] font-bold text-primary-foreground font-mono">XR</span>
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-tight text-foreground">
              Terra<span className="xr-gradient-text">Cloud</span>
            </div>
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground">XR · Edition</div>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin space-y-5">
        {SECTIONS.map(section => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = isActive(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all relative group ${
                      active
                        ? "text-foreground bg-sidebar-accent"
                        : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                    }`}
                  >
                    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-primary to-primary-glow rounded-r" />}
                    <item.icon className={`h-[16px] w-[16px] shrink-0 ${active ? "text-primary" : ""}`} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-3">
        <NavLink
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all relative ${
            isActive("/settings") ? "text-foreground bg-sidebar-accent" : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"
          }`}
        >
          {isActive("/settings") && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-primary to-primary-glow rounded-r" />}
          <Settings className={`h-[16px] w-[16px] shrink-0 ${isActive("/settings") ? "text-primary" : ""}`} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
