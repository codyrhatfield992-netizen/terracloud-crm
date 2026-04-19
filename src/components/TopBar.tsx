import { Search, Plus, Bell, LogOut, Settings, Headset, Monitor } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLeads } from "@/hooks/useLeads";
import { useContacts } from "@/hooks/useContacts";
import { useProperties } from "@/hooks/useProperties";
import { toast } from "sonner";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Mission Control",
  "/leads": "Buyer Intelligence",
  "/properties": "Properties",
  "/contacts": "Contacts",
  "/tasks": "Tasks",
  "/meetings": "Meetings",
  "/documents": "Documents",
  "/settings": "Settings",
  "/lead-hunt": "LeadHunt",
  "/command-center": "Command Center",
  "/simulations": "Simulations",
  "/deal-autopsy": "Deal Autopsy",
  "/analytics": "Analytics",
};

interface SearchResult {
  type: "lead" | "contact" | "property";
  id: string;
  title: string;
  subtitle: string;
}

export default function TopBar() {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [xrMode, setXrMode] = useState<"desktop" | "vr">("desktop");
  const navigate = useNavigate();
  const location = useLocation();
  const newMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { data: leads = [] } = useLeads();
  const { data: contacts = [] } = useContacts();
  const { data: properties = [] } = useProperties();

  const breadcrumb = breadcrumbMap[location.pathname] || location.pathname.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ");

  const userEmail = user?.email ?? "";
  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : userEmail.slice(0, 2).toUpperCase();

  const searchResults: SearchResult[] = useMemo(() => {
    if (search.length < 2) return [];
    const q = search.toLowerCase();
    return [
      ...leads.filter(l => l.title.toLowerCase().includes(q)).slice(0, 3).map(l => ({ type: "lead" as const, id: l.id, title: l.title, subtitle: "Lead" })),
      ...contacts.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3).map(c => ({ type: "contact" as const, id: c.id, title: c.name, subtitle: c.type })),
      ...properties.filter(p => p.address.toLowerCase().includes(q)).slice(0, 3).map(p => ({ type: "property" as const, id: p.id, title: p.address, subtitle: `${p.city}, ${p.state}` })),
    ];
  }, [search, leads, contacts, properties]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) setShowNewMenu(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchSelect = (result: SearchResult) => {
    const routeMap = { lead: "/leads", contact: "/contacts", property: "/properties" };
    navigate(`${routeMap[result.type]}/${result.id}`);
    setSearch("");
    setSearchFocused(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    setShowUserMenu(false);
    navigate("/login");
  };

  const ModeIcon = xrMode === "vr" ? Headset : Monitor;

  return (
    <header className="h-14 border-b border-border bg-background/60 backdrop-blur-md flex items-center px-6 shrink-0 z-10">
      {/* Left: breadcrumb */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <h2 className="text-sm font-medium text-foreground truncate">{breadcrumb}</h2>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest border border-success/30 text-success bg-success/5">
          <span className="h-1.5 w-1.5 rounded-full bg-success xr-live-dot" /> Online
        </span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients, listings, simulations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            className="w-full h-8 pl-9 pr-12 rounded-md bg-secondary/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground border border-border rounded px-1 py-0.5 bg-background/50">⌘K</kbd>

          {searchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 xr-glass-strong rounded-md shadow-elevated overflow-hidden z-50">
              {searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onMouseDown={() => handleSearchSelect(result)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent transition-colors text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest ml-3 shrink-0">{result.type}</span>
                </button>
              ))}
            </div>
          )}
          {searchFocused && search.length >= 2 && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 xr-glass-strong rounded-md shadow-elevated p-4 z-50">
              <p className="text-sm text-muted-foreground text-center">No results</p>
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-end gap-1.5">
        {/* XR Mode pill */}
        <button
          onClick={() => setXrMode(xrMode === "desktop" ? "vr" : "desktop")}
          className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md xr-glass text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition"
          title={`Switch to ${xrMode === "desktop" ? "VR" : "Desktop"}`}
        >
          <ModeIcon className="h-3.5 w-3.5 text-primary" />
          <span>XR · {xrMode}</span>
        </button>

        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>

        <div className="relative" ref={newMenuRef}>
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="h-8 px-3 flex items-center gap-1.5 rounded-md bg-gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-glow"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline text-[13px]">New</span>
          </button>
          {showNewMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-48 xr-glass-strong rounded-md shadow-elevated overflow-hidden z-50 py-1">
              {[
                { label: "Launch Simulation", path: "/command-center" },
                { label: "New Lead", path: "/leads" },
                { label: "New Contact", path: "/contacts" },
                { label: "New Property", path: "/properties" },
                { label: "New Task", path: "/tasks" },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { navigate(item.path); setShowNewMenu(false); }}
                  className="w-full text-left px-3 py-2 text-[13px] text-foreground hover:bg-accent transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="h-8 w-8 rounded-lg xr-glass flex items-center justify-center text-xs font-medium text-foreground hover:border-primary/40 transition-colors ml-1"
            title={userEmail}
          >
            {userInitials}
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-56 xr-glass-strong rounded-md shadow-elevated overflow-hidden z-50">
              <div className="px-3 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">{user?.user_metadata?.full_name || "Operator"}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
              <div className="py-1">
                <button onClick={() => { navigate("/settings"); setShowUserMenu(false); }} className="w-full text-left px-3 py-2 text-[13px] text-foreground hover:bg-accent transition-colors flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" /> Settings
                </button>
              </div>
              <div className="border-t border-border py-1">
                <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-[13px] text-destructive hover:bg-accent transition-colors flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
