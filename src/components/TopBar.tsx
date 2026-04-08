import { Search, Plus, Bell } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TopBar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search leads, contacts, properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-4 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>
        <button
          onClick={() => navigate("/leads")}
          className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Lead
        </button>
      </div>
    </header>
  );
}
