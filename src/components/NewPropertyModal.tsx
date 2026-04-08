import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface NewPropertyModalProps {
  open: boolean;
  onClose: () => void;
}

const PROPERTY_TYPES = ["Single Family", "Multi Family", "Condo", "Townhouse", "Land", "Commercial"] as const;

export default function NewPropertyModal({ open, onClose }: NewPropertyModalProps) {
  const [form, setForm] = useState({
    address: "", city: "", state: "", zip: "",
    type: "Single Family" as string,
    beds: "", baths: "", sqft: "",
    arv: "", asking_price: "",
    tags: ""
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  if (!open) return null;

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.address.trim()) newErrors.address = true;
    if (!form.city.trim()) newErrors.city = true;
    if (!form.state.trim()) newErrors.state = true;
    if (!form.zip.trim()) newErrors.zip = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    toast.success("Property created successfully");
    onClose();
    setForm({ address: "", city: "", state: "", zip: "", type: "Single Family", beds: "", baths: "", sqft: "", arv: "", asking_price: "", tags: "" });
    setErrors({});
  };

  const inputClass = (field: string) =>
    `w-full h-9 px-3 rounded-md bg-secondary border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${errors[field] ? "border-destructive" : "border-border"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[700px] mx-4 bg-card border border-border rounded-lg shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">New Property</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Street Address *</label>
              <input value={form.address} onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setErrors(er => ({ ...er, address: false })); }} placeholder="123 Main Street" className={inputClass("address")} />
              {errors.address && <p className="text-xs text-destructive mt-1">Address is required</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">City *</label>
              <input value={form.city} onChange={e => { setForm(f => ({ ...f, city: e.target.value })); setErrors(er => ({ ...er, city: false })); }} placeholder="Austin" className={inputClass("city")} />
              {errors.city && <p className="text-xs text-destructive mt-1">City is required</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">State *</label>
                <input value={form.state} onChange={e => { setForm(f => ({ ...f, state: e.target.value })); setErrors(er => ({ ...er, state: false })); }} placeholder="TX" className={inputClass("state")} />
                {errors.state && <p className="text-xs text-destructive mt-1">Required</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Zip *</label>
                <input value={form.zip} onChange={e => { setForm(f => ({ ...f, zip: e.target.value })); setErrors(er => ({ ...er, zip: false })); }} placeholder="78701" className={inputClass("zip")} />
                {errors.zip && <p className="text-xs text-destructive mt-1">Required</p>}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Property Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Bedrooms</label>
              <input type="number" value={form.beds} onChange={e => setForm(f => ({ ...f, beds: e.target.value }))} placeholder="3" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Bathrooms</label>
              <input type="number" step="0.5" value={form.baths} onChange={e => setForm(f => ({ ...f, baths: e.target.value }))} placeholder="2.5" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Sq Ft</label>
              <input type="number" value={form.sqft} onChange={e => setForm(f => ({ ...f, sqft: e.target.value }))} placeholder="1,850" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">ARV</label>
              <input type="number" value={form.arv} onChange={e => setForm(f => ({ ...f, arv: e.target.value }))} placeholder="385,000" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Asking Price</label>
              <input type="number" value={form.asking_price} onChange={e => setForm(f => ({ ...f, asking_price: e.target.value }))} placeholder="275,000" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Tags</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Fixer-upper, Pool, Corner Lot (comma separated)" className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="h-9 px-4 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Create Property</button>
        </div>
      </div>
    </div>
  );
}
