import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, List, Plus, Search, Building2, Bed, Bath, Maximize, X, ArrowUpDown, ArrowUp, ArrowDown, Home } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatusBadge, { propertyStatusVariant } from "@/components/StatusBadge";
import { useProperties, useCreateProperty, type DbProperty } from "@/hooks/useProperties";
import { formatCurrency } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

const PROPERTY_TYPES = ["Single Family", "Multi Family", "Condo", "Townhouse", "Land", "Commercial"] as const;
const STATUSES = ["Available", "Under Contract", "Sold", "Off Market"] as const;

type SortKey = "address" | "city" | "property_type" | "beds" | "baths" | "sqft" | "arv" | "asking_price" | "status" | "created_at";
type SortDir = "asc" | "desc";

function NewPropertyModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (p: Partial<DbProperty>) => void }) {
  const [form, setForm] = useState({ address: "", city: "", state: "", zip: "", property_type: "Single Family", beds: "", baths: "", sqft: "", arv: "", asking_price: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  if (!open) return null;

  const handleSubmit = () => {
    const e: Record<string, boolean> = {};
    if (!form.address.trim()) e.address = true;
    if (!form.city.trim()) e.city = true;
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSubmit({
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zip: form.zip.trim(),
      property_type: form.property_type,
      beds: parseInt(form.beds) || 0,
      baths: parseFloat(form.baths) || 0,
      sqft: parseInt(form.sqft) || 0,
      arv: parseInt(form.arv) || 0,
      asking_price: parseInt(form.asking_price) || 0,
    });
    onClose();
    setForm({ address: "", city: "", state: "", zip: "", property_type: "Single Family", beds: "", baths: "", sqft: "", arv: "", asking_price: "" });
  };

  const inputClass = (field: string) =>
    `w-full h-9 px-3 rounded-md bg-secondary border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${errors[field] ? "border-destructive" : "border-border"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[700px] mx-4 bg-card border border-border rounded-lg shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">New Property</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Street Address *</label>
            <input value={form.address} onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setErrors(er => ({ ...er, address: false })); }} placeholder="123 Main Street" className={inputClass("address")} />
            {errors.address && <p className="text-xs text-destructive mt-1">Required</p>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">City *</label>
              <input value={form.city} onChange={e => { setForm(f => ({ ...f, city: e.target.value })); setErrors(er => ({ ...er, city: false })); }} placeholder="Austin" className={inputClass("city")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">State</label>
              <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="TX" className={inputClass("")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Zip</label>
              <input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} placeholder="78701" className={inputClass("")} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Property Type</label>
            <select value={form.property_type} onChange={e => setForm(f => ({ ...f, property_type: e.target.value }))} className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary">
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Beds</label><input type="number" value={form.beds} onChange={e => setForm(f => ({ ...f, beds: e.target.value }))} placeholder="3" className={inputClass("")} /></div>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Baths</label><input type="number" step="0.5" value={form.baths} onChange={e => setForm(f => ({ ...f, baths: e.target.value }))} placeholder="2" className={inputClass("")} /></div>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Sq Ft</label><input type="number" value={form.sqft} onChange={e => setForm(f => ({ ...f, sqft: e.target.value }))} placeholder="1850" className={inputClass("")} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">ARV</label><input type="number" value={form.arv} onChange={e => setForm(f => ({ ...f, arv: e.target.value }))} placeholder="385000" className={inputClass("")} /></div>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Asking Price</label><input type="number" value={form.asking_price} onChange={e => setForm(f => ({ ...f, asking_price: e.target.value }))} placeholder="275000" className={inputClass("")} /></div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="h-9 px-4 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={handleSubmit} className="h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Create Property</button>
        </div>
      </div>
    </div>
  );
}

export default function Properties() {
  const { data: properties = [], isLoading } = useProperties();
  const createProperty = useCreateProperty();
  const [view, setView] = useState<"cards" | "list">("cards");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let result = properties.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.address.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
      const matchStatus = statusFilter.length === 0 || statusFilter.includes(p.status);
      return matchSearch && matchStatus;
    });
    result.sort((a, b) => {
      const aVal = a[sortKey as keyof DbProperty];
      const bVal = b[sortKey as keyof DbProperty];
      if (typeof aVal === "number" && typeof bVal === "number") return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      return sortDir === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return result;
  }, [properties, search, statusFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 ml-1 text-primary" /> : <ArrowDown className="h-3 w-3 ml-1 text-primary" />;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Properties</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} propert{filtered.length !== 1 ? "ies" : "y"}</p>
          </div>
          <button onClick={() => setShowModal(true)} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> New Property
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search by address..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="flex items-center gap-1.5">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(f => f.includes(s) ? f.filter(x => x !== s) : [...f, s])}
                className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${statusFilter.includes(s) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center border border-border rounded-md overflow-hidden ml-auto">
            <button onClick={() => setView("cards")} className={`h-9 w-9 flex items-center justify-center transition-colors ${view === "cards" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid className="h-4 w-4" /></button>
            <button onClick={() => setView("list")} className={`h-9 w-9 flex items-center justify-center transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}><List className="h-4 w-4" /></button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
                <Skeleton className="h-[200px] w-full" />
                <div className="p-4 space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-6 w-24" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Home className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No properties found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {search || statusFilter.length > 0 ? "Try adjusting your search or filters" : "Get started by adding your first property"}
            </p>
            <button onClick={() => setShowModal(true)} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" /> New Property
            </button>
          </div>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <Link key={p.id} to={`/properties/${p.id}`} className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200">
                <div className="relative h-[200px] bg-secondary flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-muted-foreground/20" />
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded text-[11px] font-semibold text-primary-foreground ${statusOverlayColor(p.status)}`}>{p.status}</span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">{p.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.city}, {p.state} {p.zip}</p>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-secondary-foreground">{p.property_type}</span>
                  {(p.beds > 0 || p.baths > 0 || p.sqft > 0) && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {p.beds > 0 && <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{p.beds}</span>}
                      {p.baths > 0 && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{p.baths}</span>}
                      {p.sqft > 0 && <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{p.sqft.toLocaleString()} sqft</span>}
                    </div>
                  )}
                  <p className="text-lg font-bold text-foreground">{formatCurrency(Number(p.arv))}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      { key: "address" as SortKey, label: "Address" },
                      { key: "city" as SortKey, label: "City" },
                      { key: "property_type" as SortKey, label: "Type" },
                      { key: "arv" as SortKey, label: "ARV" },
                      { key: "status" as SortKey, label: "Status" },
                      { key: "created_at" as SortKey, label: "Created" },
                    ].map(c => (
                      <th key={c.key} onClick={() => handleSort(c.key)}
                        className="text-left text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer hover:text-foreground transition-colors select-none">
                        <span className="inline-flex items-center">{c.label}<SortIcon col={c.key} /></span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id} className={`border-b border-border hover:bg-secondary/30 transition-colors ${i % 2 === 1 ? "bg-secondary/10" : ""}`}>
                      <td className="px-4 py-3"><Link to={`/properties/${p.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{p.address}</Link></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.city}, {p.state}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-secondary-foreground">{p.property_type}</span></td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{formatCurrency(Number(p.arv))}</td>
                      <td className="px-4 py-3"><StatusBadge variant={propertyStatusVariant(p.status)}>{p.status}</StatusBadge></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <NewPropertyModal open={showModal} onClose={() => setShowModal(false)} onSubmit={p => createProperty.mutate(p)} />
    </AppLayout>
  );
}
