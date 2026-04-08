import { Search, Plus, ChevronDown, Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { leads, contacts, properties } from "@/data/mockData";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/properties": "Properties",
  "/contacts": "Contacts",
  "/tasks": "Tasks",
  "/meetings": "Meetings",
  "/documents": "Documents",
  "/settings": "Settings",
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

  const breadcrumb = breadcrumbMap[location.pathname] || location.pathname.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ");

  // Search results
  const searchResults: SearchResult[] = search.length >= 2
    ? [
        ...leads.filter(l => l.title.toLowerCase().includes(search.toLowerCase())).slice(0, 3).map(l => ({ type: "lead" as const, id: l.id, title: l.title, subtitle: "Lead" })),
        ...contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 3).map(c => ({ type: "contact" as const, id: c.id, title: c.name, subtitle: c.type })),
        ...properties.filter(p => p.address.toLowerCase().includes(search.toLowerCase())).slice(0, 3).map(p => ({ type: "property" as const, id: p.id, title: p.address, subtitle: `${p.city}, ${p.state}` })),
      ]
    : [];

  // Close menus on outside click
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

  return (
    <header className="h-14 border-b border-border bg-background flex items-center px-6 shrink-0">
      {/* Left: Breadcrumb */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-medium text-foreground">{breadcrumb}</h2>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads, contacts, properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
          />
          {/* Keyboard shortcut hint */}
          {!searchFocused && !search && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center">
              <kbd className="px-1.5 py-0.5 text-[10px] text-muted-foreground bg-background border border-border rounded font-mono">⌘K</kbd>
            </div>
          )}

          {/* Search Results Dropdown */}
          {searchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
              {searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onMouseDown={() => handleSearchSelect(result)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/60 transition-colors text-left"
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
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 p-4">
              <p className="text-sm text-muted-foreground text-center">No results found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex-1 flex items-center justify-end gap-2">
        <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* New Lead Dropdown */}
        <div className="relative" ref={newMenuRef}>
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="h-9 px-4 flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Lead</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>
          {showNewMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
              {[
                { label: "New Lead", path: "/leads" },
                { label: "New Contact", path: "/contacts" },
                { label: "New Property", path: "/properties" },
                { label: "New Task", path: "/tasks" },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { navigate(item.path); setShowNewMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary/60 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary hover:bg-primary/30 transition-colors ml-1"
          >
            AR
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">Alex Rivera</p>
                <p className="text-xs text-muted-foreground">alex@terracloud.io</p>
              </div>
              <button onClick={() => { navigate("/settings"); setShowUserMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary/60 transition-colors">
                Settings
              </button>
              <button className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-secondary/60 transition-colors">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
