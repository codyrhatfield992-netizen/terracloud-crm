import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, Contact2, CheckSquare, Calendar, FileText,
  Settings, Crosshair, Sparkles, FileSearch, TrendingUp, Cloud, GraduationCap,
  Rocket, Radio, History, Trophy, Shield, ClipboardList,
} from "lucide-react";

type NavItem = { label: string; path: string; icon: typeof LayoutDashboard };

const SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Training OS",
    items: [
      { label: "Practice Dashboard", path: "/practice", icon: GraduationCap },
      { label: "Practice Launcher", path: "/practice/launch", icon: Rocket },
      { label: "Live Session", path: "/practice/live/sess-live", icon: Radio },
      { label: "Session History", path: "/practice/history", icon: History },
      { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
    ],
  },
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
      { label: "XR Simulations", path: "/simulations", icon: Sparkles },
      { label: "Deal Autopsy", path: "/deal-autopsy", icon: FileSearch },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Coach Console", path: "/coach", icon: ClipboardList },
      { label: "Admin CMS", path: "/admin", icon: Shield },
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar/95 border-r border-sidebar-border flex flex-col z-50 backdrop-blur-xl">
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-lg xr-glass-strong flex items-center justify-center xr-glow">
            <Cloud className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-semibold bg-primary text-primary-foreground rounded px-1">AI</span>
          </div>
          <div className="leading-tight">
            <div className="text-[14px] font-semibold tracking-tight text-foreground">TerraCloud <span className="xr-silver-text">XR</span></div>
            <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Simulation OS</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin space-y-5">
        {SECTIONS.map(section => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[9px] font-mono uppercase tracking-[0.22em] text-muted-foreground/60">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = isActive(item.path);
                return (
                  <NavLink key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all relative group ${active ? "text-foreground bg-sidebar-accent shadow-panel" : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/60"}`}>
                    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />}
                    <item.icon className={`h-[16px] w-[16px] shrink-0 ${active ? "text-primary" : ""}`} strokeWidth={1.75} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-sidebar-border pt-3">
        <NavLink to="/settings" className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all relative ${isActive("/settings") ? "text-foreground bg-sidebar-accent" : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"}`}>
          {isActive("/settings") && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />}
          <Settings className={`h-[16px] w-[16px] shrink-0 ${isActive("/settings") ? "text-primary" : ""}`} strokeWidth={1.75} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
