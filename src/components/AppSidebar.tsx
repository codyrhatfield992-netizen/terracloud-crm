import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Contact2,
  CheckSquare,
  Calendar,
  FileText,
  Settings,
  Target,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", path: "/leads", icon: Users },
  { label: "LeadHunt", path: "/lead-hunt", icon: Target },
  { label: "Properties", path: "/properties", icon: Building2 },
  { label: "Contacts", path: "/contacts", icon: Contact2 },
  { label: "Tasks", path: "/tasks", icon: CheckSquare },
  { label: "Meetings", path: "/meetings", icon: Calendar },
  { label: "Documents", path: "/documents", icon: FileText },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-background border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-border">
        <span className="text-base font-semibold tracking-tight text-foreground">
          Terra<span className="text-primary">Cloud</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors relative ${
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
              )}
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="px-3 pb-4 border-t border-border pt-3">
        <NavLink
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors relative ${
            location.pathname === "/settings"
              ? "text-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          {location.pathname === "/settings" && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
          )}
          <Settings className="h-[18px] w-[18px] shrink-0" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
