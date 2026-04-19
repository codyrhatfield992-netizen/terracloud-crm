import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, Contact2, CheckSquare, Calendar, FileText,
  Settings, Crosshair, Sparkles, FileSearch, TrendingUp, Cloud,
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
      {/* Logo — TerraCloud XR wordmark */}
      <div className="h-14 flex items-center px-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Cloud className="h-5 w-5 text-foreground/90" strokeWidth={1.5} />
            <span className="absolute -bottom-0.5 -right-1 text-[7px] font-mono font-semibold text-muted-foreground tracking-tight">XR</span>
          </div>
          <div className="leading-tight">
            <div className="text-[14px] font-semibold tracking-tight text-foreground">
              TerraCloud <span className="text-muted-foreground/70 font-normal">XR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin space-y-5">
        {SECTIONS.map(section => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[9px] font-mono uppercase tracking-[0.22em] text-muted-foreground/50">{section.label}</p>
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
                    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground/80 rounded-r" />}
                    <item.icon className={`h-[16px] w-[16px] shrink-0 ${active ? "text-foreground" : ""}`} strokeWidth={1.75} />
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
          {isActive("/settings") && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground/80 rounded-r" />}
          <Settings className={`h-[16px] w-[16px] shrink-0 ${isActive("/settings") ? "text-foreground" : ""}`} strokeWidth={1.75} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
