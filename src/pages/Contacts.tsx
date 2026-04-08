import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, X, ArrowUpDown, ArrowUp, ArrowDown, Users } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { contacts } from "@/data/mockData";
import { toast } from "sonner";

const TYPES = ["Seller", "Buyer", "Agent", "Other"] as const;

const typeVariant = (t: string) => {
  switch (t) {
    case "Seller": return "primary" as const;
    case "Buyer": return "success" as const;
    case "Agent": return "warning" as const;
    default: return "outline" as const;
  }
};

type SortKey = "name" | "email" | "phone" | "type" | "created_at";
type SortDir = "asc" | "desc";

// ── New Contact Modal ──
function NewContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", type: "Seller", source: "", tags: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  if (!open) return null;

  const handleSubmit = () => {
    const e: Record<string, boolean> = {};
    if (!form.firstName.trim()) e.firstName = true;
    if (!form.lastName.trim()) e.lastName = true;
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    toast.success(`Contact "${form.firstName} ${form.lastName}" created`);
    onClose();
    setForm({ firstName: "", lastName: "", email: "", phone: "", type: "Seller", source: "", tags: "" });
    setErrors({});
  };

  const inputClass = (field: string) =>
    `w-full h-9 px-3 rounded-md bg-secondary border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${errors[field] ? "border-destructive" : "border-border"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[560px] mx-4 bg-card border border-border rounded-lg shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">New Contact</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">First Name *</label>
              <input value={form.firstName} onChange={e => { setForm(f => ({ ...f, firstName: e.target.value })); setErrors(er => ({ ...er, firstName: false })); }} placeholder="John" className={inputClass("firstName")} />
              {errors.firstName && <p className="text-xs text-destructive mt-1">Required</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Last Name *</label>
              <input value={form.lastName} onChange={e => { setForm(f => ({ ...f, lastName: e.target.value })); setErrors(er => ({ ...er, lastName: false })); }} placeholder="Doe" className={inputClass("lastName")} />
              {errors.lastName && <p className="text-xs text-destructive mt-1">Required</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@email.com" className={inputClass("")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(512) 555-0000" className={inputClass("")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Contact Type *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Source</label>
              <input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="Referral from John" className={inputClass("")} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Tags</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Motivated, Cash Buyer (comma separated)" className={inputClass("")} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="h-9 px-4 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Create Contact</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function Contacts() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const allTags = useMemo(() => [...new Set(contacts.flatMap(c => c.tags))].sort(), []);

  const activeFilters = useMemo(() => {
    const pills: { label: string; clear: () => void }[] = [];
    typeFilter.forEach(t => pills.push({ label: `Type: ${t}`, clear: () => setTypeFilter(f => f.filter(x => x !== t)) }));
    tagFilter.forEach(t => pills.push({ label: `Tag: ${t}`, clear: () => setTagFilter(f => f.filter(x => x !== t)) }));
    return pills;
  }, [typeFilter, tagFilter]);

  const filtered = useMemo(() => {
    let result = contacts.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
      const matchType = typeFilter.length === 0 || typeFilter.includes(c.type);
      const matchTags = tagFilter.length === 0 || tagFilter.some(t => c.tags.includes(t));
      return matchSearch && matchType && matchTags;
    });
    result.sort((a, b) => {
      const aVal = a[sortKey]; const bVal = b[sortKey];
      return sortDir === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return result;
  }, [search, typeFilter, tagFilter, sortKey, sortDir]);

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

  const [showTagDropdown, setShowTagDropdown] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Contacts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} of {contacts.length} contacts</p>
          </div>
          <button onClick={() => setShowModal(true)} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> New Contact
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search by name, email, or phone..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          {/* Type filter chips */}
          <div className="flex items-center gap-1.5">
            {TYPES.map(t => (
              <button key={t} onClick={() => toggleMulti(typeFilter, t, setTypeFilter)}
                className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${typeFilter.includes(t) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {t}
              </button>
            ))}
          </div>
          {/* Tag filter dropdown */}
          <div className="relative">
            <button onClick={() => setShowTagDropdown(!showTagDropdown)}
              className={`h-9 px-3 rounded-md border text-sm font-medium transition-colors ${tagFilter.length > 0 ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
              Tags {tagFilter.length > 0 && <span className="ml-1">({tagFilter.length})</span>}
            </button>
            {showTagDropdown && (
              <div className="absolute top-full mt-1 right-0 z-30 bg-popover border border-border rounded-lg shadow-xl py-2 w-56 max-h-[300px] overflow-y-auto scrollbar-thin animate-fade-in">
                {allTags.map(t => (
                  <button key={t} onClick={() => toggleMulti(tagFilter, t, setTagFilter)}
                    className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${tagFilter.includes(t) ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"}`}>
                    {tagFilter.includes(t) && "✓ "}{t}
                  </button>
                ))}
                {tagFilter.length > 0 && (
                  <button onClick={() => setTagFilter([])} className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border-t border-border mt-1 pt-2">Clear tags</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">
                {f.label}
                <button onClick={f.clear} className="hover:text-primary-foreground transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
            <button onClick={() => { setTypeFilter([]); setTagFilter([]); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear all</button>
          </div>
        )}

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No contacts found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {search || activeFilters.length > 0 ? "Try adjusting your search or filters" : "Add your first contact to get started"}
            </p>
            <button onClick={() => setShowModal(true)} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" /> New Contact
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {([
                      { key: "name" as SortKey, label: "Name" },
                      { key: "email" as SortKey, label: "Email" },
                      { key: "phone" as SortKey, label: "Phone" },
                      { key: "type" as SortKey, label: "Type" },
                      { key: null, label: "Tags" },
                      { key: "created_at" as SortKey, label: "Created" },
                    ] as const).map((col) => (
                      <th key={col.label}
                        onClick={() => col.key && handleSort(col.key)}
                        className={`text-left text-xs font-medium text-muted-foreground px-4 py-3 select-none ${col.key ? "cursor-pointer hover:text-foreground" : ""} transition-colors`}>
                        <span className="inline-flex items-center">
                          {col.label}
                          {col.key && <SortIcon col={col.key} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.id} className={`border-b border-border hover:bg-secondary/30 transition-colors ${i % 2 === 1 ? "bg-secondary/10" : ""}`}>
                      <td className="px-4 py-3">
                        <Link to={`/contacts/${c.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">{c.name}</Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{c.email}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{c.phone}</td>
                      <td className="px-4 py-3"><StatusBadge variant={typeVariant(c.type)}>{c.type}</StatusBadge></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {c.tags.slice(0, 3).map(t => (
                            <span key={t} className="px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-secondary-foreground">{t}</span>
                          ))}
                          {c.tags.length > 3 && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium text-muted-foreground">+{c.tags.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <NewContactModal open={showModal} onClose={() => setShowModal(false)} />
    </AppLayout>
  );
}
