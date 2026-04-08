import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, List, Plus, Search, Building2, Bed, Bath, Maximize, X, ArrowUpDown, ArrowUp, ArrowDown, Home } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { propertyStatusVariant } from "@/components/StatusBadge";
import NewPropertyModal from "@/components/NewPropertyModal";
import { properties, formatCurrency } from "@/data/mockData";
import type { Property } from "@/data/mockData";

const PROPERTY_TYPES = ["Single Family", "Multi Family", "Condo", "Townhouse", "Land", "Commercial"] as const;
const STATUSES = ["Available", "Under Contract", "Sold", "Off Market"] as const;

type SortKey = "address" | "city" | "type" | "beds" | "baths" | "sqft" | "arv" | "asking_price" | "status" | "created_at";
type SortDir = "asc" | "desc";

export default function Properties() {
  const [view, setView] = useState<"cards" | "list">("cards");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const cities = useMemo(() => [...new Set(properties.map(p => p.city))].sort(), []);

  const activeFilters = useMemo(() => {
    const pills: { label: string; clear: () => void }[] = [];
    cityFilter.forEach(c => pills.push({ label: `City: ${c}`, clear: () => setCityFilter(f => f.filter(x => x !== c)) }));
    typeFilter.forEach(t => pills.push({ label: `Type: ${t}`, clear: () => setTypeFilter(f => f.filter(x => x !== t)) }));
    statusFilter.forEach(s => pills.push({ label: `Status: ${s}`, clear: () => setStatusFilter(f => f.filter(x => x !== s)) }));
    if (priceMin) pills.push({ label: `Min ARV: $${Number(priceMin).toLocaleString()}`, clear: () => setPriceMin("") });
    if (priceMax) pills.push({ label: `Max ARV: $${Number(priceMax).toLocaleString()}`, clear: () => setPriceMax("") });
    return pills;
  }, [cityFilter, typeFilter, statusFilter, priceMin, priceMax]);

  const filtered = useMemo(() => {
    let result = properties.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.address.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.state.toLowerCase().includes(q) || p.zip.includes(q);
      const matchCity = cityFilter.length === 0 || cityFilter.includes(p.city);
      const matchType = typeFilter.length === 0 || typeFilter.includes(p.type);
      const matchStatus = statusFilter.length === 0 || statusFilter.includes(p.status);
      const matchMin = !priceMin || p.arv >= Number(priceMin);
      const matchMax = !priceMax || p.arv <= Number(priceMax);
      return matchSearch && matchCity && matchType && matchStatus && matchMin && matchMax;
    });
    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      return sortDir === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return result;
  }, [search, cityFilter, typeFilter, statusFilter, priceMin, priceMax, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 ml-1 text-primary" /> : <ArrowDown className="h-3 w-3 ml-1 text-primary" />;
  };

  const toggleMulti = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const statusOverlayColor = (s: string) => {
    switch (s) {
      case "Available": return "bg-primary";
      case "Under Contract": return "bg-warning";
      case "Sold": return "bg-success";
      case "Off Market": return "bg-muted-foreground";
      default: return "bg-muted";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Properties</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} of {properties.length} properties</p>
          </div>
          <button onClick={() => setShowModal(true)} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> New Property
          </button>
        </div>

        {/* Search + Filters + View Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search by address..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`h-9 px-3 rounded-md border text-sm font-medium transition-colors ${showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
            Filters {activeFilters.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary">{activeFilters.length}</span>}
          </button>
          <div className="flex items-center border border-border rounded-md overflow-hidden ml-auto">
            <button onClick={() => setView("cards")} className={`h-9 w-9 flex items-center justify-center transition-colors ${view === "cards" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView("list")} className={`h-9 w-9 flex items-center justify-center transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">City</label>
                <div className="flex flex-wrap gap-1.5">
                  {cities.map(c => (
                    <button key={c} onClick={() => toggleMulti(cityFilter, c, setCityFilter)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${cityFilter.includes(c) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Property Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {PROPERTY_TYPES.map(t => (
                    <button key={t} onClick={() => toggleMulti(typeFilter, t, setTypeFilter)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${typeFilter.includes(t) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => toggleMulti(statusFilter, s, setStatusFilter)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${statusFilter.includes(s) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">ARV Range</label>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                    className="w-full h-8 px-2 rounded bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                  <span className="text-muted-foreground text-xs">–</span>
                  <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                    className="w-full h-8 px-2 rounded bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Pills */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">
                {f.label}
                <button onClick={f.clear} className="hover:text-primary-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            <button onClick={() => { setCityFilter([]); setTypeFilter([]); setStatusFilter([]); setPriceMin(""); setPriceMax(""); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear all</button>
          </div>
        )}

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Home className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No properties found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {search || activeFilters.length > 0 ? "Try adjusting your search or filters" : "Get started by adding your first property"}
            </p>
            <button onClick={() => setShowModal(true)} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" /> New Property
            </button>
          </div>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <PropertyCard key={p.id} property={p} statusOverlayColor={statusOverlayColor} />
            ))}
          </div>
        ) : (
          <PropertyTable properties={filtered} sortKey={sortKey} handleSort={handleSort} SortIcon={SortIcon} />
        )}
      </div>
      <NewPropertyModal open={showModal} onClose={() => setShowModal(false)} />
    </AppLayout>
  );
}

function PropertyCard({ property: p, statusOverlayColor }: { property: Property; statusOverlayColor: (s: string) => string }) {
  return (
    <Link to={`/properties/${p.id}`}
      className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative h-[200px] bg-secondary flex items-center justify-center">
        <Building2 className="h-10 w-10 text-muted-foreground/20" />
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded text-[11px] font-semibold text-primary-foreground ${statusOverlayColor(p.status)}`}>
          {p.status}
        </span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">{p.address}</p>
          <p className="text-xs text-muted-foreground mt-1">{p.city}, {p.state} {p.zip}</p>
        </div>
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-secondary-foreground">{p.type}</span>
        {(p.beds > 0 || p.baths > 0 || p.sqft > 0) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {p.beds > 0 && <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{p.beds}</span>}
            {p.baths > 0 && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{p.baths}</span>}
            {p.sqft > 0 && <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{p.sqft.toLocaleString()} sqft</span>}
          </div>
        )}
        <p className="text-lg font-bold text-foreground">{formatCurrency(p.arv)}</p>
      </div>
    </Link>
  );
}

function PropertyTable({ properties, sortKey, handleSort, SortIcon }: {
  properties: Property[];
  sortKey: SortKey;
  handleSort: (k: SortKey) => void;
  SortIcon: React.FC<{ col: SortKey }>;
}) {
  const cols: { key: SortKey; label: string; align?: string }[] = [
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "type", label: "Type" },
    { key: "beds", label: "Beds" },
    { key: "baths", label: "Baths" },
    { key: "sqft", label: "Sq Ft", align: "right" },
    { key: "arv", label: "ARV", align: "right" },
    { key: "asking_price", label: "Asking", align: "right" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Created" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {cols.map(c => (
                <th key={c.key} onClick={() => handleSort(c.key)}
                  className={`text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer hover:text-foreground transition-colors select-none ${c.align === "right" ? "text-right" : "text-left"}`}>
                  <span className="inline-flex items-center">{c.label}<SortIcon col={c.key} /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {properties.map((p, i) => (
              <tr key={p.id} className={`border-b border-border hover:bg-secondary/30 transition-colors ${i % 2 === 1 ? "bg-secondary/10" : ""}`}>
                <td className="px-4 py-3">
                  <Link to={`/properties/${p.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{p.address}</Link>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.city}, {p.state}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-secondary-foreground">{p.type}</span></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.beds > 0 ? p.beds : "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{p.baths > 0 ? p.baths : "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground text-right">{p.sqft > 0 ? p.sqft.toLocaleString() : "—"}</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground text-right">{formatCurrency(p.arv)}</td>
                <td className="px-4 py-3 text-sm text-foreground text-right">{formatCurrency(p.asking_price)}</td>
                <td className="px-4 py-3"><StatusBadge variant={propertyStatusVariant(p.status)}>{p.status}</StatusBadge></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
