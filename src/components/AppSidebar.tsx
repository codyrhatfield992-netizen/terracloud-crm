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
    <aside className="fixed left-0 top-0 h-screen w-56 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="h-14 flex items-center px-5">
        <span className="text-base font-semibold tracking-tight text-foreground">
          Terra<span className="text-primary">Cloud</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                isActive
                  ? "text-foreground bg-sidebar-accent"
                  : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="px-3 pb-4">
        <NavLink
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
            location.pathname === "/settings"
              ? "text-foreground bg-sidebar-accent"
              : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent/50"
          }`}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
