import { Search, Plus, ChevronDown, Bell, LogOut, Settings, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { leads, contacts, properties } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/properties": "Properties",
  "/contacts": "Contacts",
  "/tasks": "Tasks",
  "/meetings": "Meetings",
  "/documents": "Documents",
  "/settings": "Settings",
  "/lead-hunt": "LeadHunt",
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
  const navigate = useNavigate();
  const location = useLocation();
  const newMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  const breadcrumb = breadcrumbMap[location.pathname] || location.pathname.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ");

  const userEmail = user?.email ?? "";
  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : userEmail.slice(0, 2).toUpperCase();

  const searchResults: SearchResult[] = search.length >= 2
    ? [
        ...leads.filter(l => l.title.toLowerCase().includes(search.toLowerCase())).slice(0, 3).map(l => ({ type: "lead" as const, id: l.id, title: l.title, subtitle: "Lead" })),
        ...contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 3).map(c => ({ type: "contact" as const, id: c.id, title: c.name, subtitle: c.type })),
        ...properties.filter(p => p.address.toLowerCase().includes(search.toLowerCase())).slice(0, 3).map(p => ({ type: "property" as const, id: p.id, title: p.address, subtitle: `${p.city}, ${p.state}` })),
      ]
    : [];

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
    toast.success("Signed out successfully");
    setShowUserMenu(false);
    navigate("/login");
  };

  return (
    <header className="h-14 border-b border-border bg-background/50 backdrop-blur-sm flex items-center px-6 shrink-0">
      {/* Left: Logo + Breadcrumb */}
      <div className="flex-1 min-w-0 flex items-center gap-4">
        <Link to="/" className="text-sm font-semibold text-foreground hover:text-primary transition-colors shrink-0">
          Terra<span className="text-primary">Cloud</span>
        </Link>
        <span className="text-border">/</span>
        <h2 className="text-sm font-medium text-muted-foreground truncate">{breadcrumb}</h2>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            className="w-full h-8 pl-9 pr-4 rounded-md bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />

          {searchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-2xl overflow-hidden z-50">
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
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider ml-3 shrink-0">{result.type}</span>
                </button>
              ))}
            </div>
          )}
          {searchFocused && search.length >= 2 && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-2xl overflow-hidden z-50 p-4">
              <p className="text-sm text-muted-foreground text-center">No results found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex-1 flex items-center justify-end gap-1.5">
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground relative">
          <Bell className="h-4 w-4" />
        </button>

        {/* New Item Dropdown */}
        <div className="relative" ref={newMenuRef}>
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="h-8 px-3 flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline text-[13px]">New</span>
          </button>
          {showNewMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-card border border-border rounded-md shadow-2xl overflow-hidden z-50 py-1">
              {[
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

        {/* User Avatar + Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center text-xs font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-colors ml-1"
            title={userEmail}
          >
            {userInitials}
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-border rounded-md shadow-2xl overflow-hidden z-50">
              <div className="px-3 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">{user?.user_metadata?.full_name || "User"}</p>
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
