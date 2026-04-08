import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, List, Plus, Search, Building2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { propertyStatusVariant } from "@/components/StatusBadge";
import { properties, formatCurrency } from "@/data/mockData";

export default function Properties() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = properties.filter(p => {
    const matchSearch = p.address.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Properties</h1>
            <p className="text-sm text-muted-foreground mt-1">{properties.length} properties</p>
          </div>
          <button className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> New Property
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search by address or city..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="Under Contract">Under Contract</option>
            <option value="Sold">Sold</option>
            <option value="Off Market">Off Market</option>
          </select>
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button onClick={() => setView("grid")} className={`h-9 w-9 flex items-center justify-center transition-colors ${view === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView("list")} className={`h-9 w-9 flex items-center justify-center transition-colors ${view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <Link key={p.id} to={`/properties/${p.id}`} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/40 transition-colors group">
                <div className="h-32 bg-secondary flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{p.address}</p>
                    <StatusBadge variant={propertyStatusVariant(p.status)}>{p.status}</StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.city}, {p.state} {p.zip}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{p.type}</span>
                    {p.beds > 0 && <span>{p.beds} bd / {p.baths} ba</span>}
                    <span>{p.sqft.toLocaleString()} sqft</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">ARV: {formatCurrency(p.arv)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Address</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Beds/Baths</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">ARV</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Asking</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className={`border-b border-border hover:bg-secondary/30 transition-colors ${i % 2 === 1 ? "bg-secondary/10" : ""}`}>
                    <td className="px-4 py-3">
                      <Link to={`/properties/${p.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{p.address}</Link>
                      <p className="text-xs text-muted-foreground">{p.city}, {p.state}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.type}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.beds > 0 ? `${p.beds}/${p.baths}` : "—"}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{formatCurrency(p.arv)}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{formatCurrency(p.asking_price)}</td>
                    <td className="px-4 py-3"><StatusBadge variant={propertyStatusVariant(p.status)}>{p.status}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
