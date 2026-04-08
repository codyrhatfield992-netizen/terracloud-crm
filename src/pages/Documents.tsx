import { useState, useMemo } from "react";
import { FileText, Search, LayoutGrid, List, Upload, Download, Trash2, X, Eye, ChevronLeft, ChevronRight, FileImage, FileSpreadsheet, File, Plus } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { documents, getUserById, getLeadById, getPropertyById, getContactById, users, DocFile } from "@/data/mockData";
import { toast } from "sonner";

const DOC_TYPES = ["Contract", "PDF", "Image", "Spreadsheet", "Other"] as const;
const ENTITY_TYPES = ["lead", "contact", "property"] as const;

function getFileIcon(type: DocFile["type"]) {
  switch (type) {
    case "PDF": case "Contract": return <FileText className="h-8 w-8 text-red-400" />;
    case "Image": return <FileImage className="h-8 w-8 text-blue-400" />;
    case "Spreadsheet": return <FileSpreadsheet className="h-8 w-8 text-green-400" />;
    default: return <File className="h-8 w-8 text-muted-foreground" />;
  }
}

function getLinkedEntityName(doc: DocFile) {
  if (doc.entity_type === "lead") return getLeadById(doc.entity_id)?.title ?? doc.entity_id;
  if (doc.entity_type === "property") return getPropertyById(doc.entity_id)?.address ?? doc.entity_id;
  if (doc.entity_type === "contact") return getContactById(doc.entity_id)?.name ?? doc.entity_id;
  return doc.entity_id;
}

export default function Documents() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string | null>(null);
  const [uploaderFilter, setUploaderFilter] = useState<string | null>(null);
  const [allDocs, setAllDocs] = useState(documents);
  const [previewDoc, setPreviewDoc] = useState<DocFile | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload modal state
  const [uploadDocType, setUploadDocType] = useState<string>("PDF");
  const [uploadLinkedType, setUploadLinkedType] = useState<string>("");
  const [uploadLinkedId, setUploadLinkedId] = useState<string>("");

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (typeFilter) activeFilters.push({ label: `Type: ${typeFilter}`, clear: () => setTypeFilter(null) });
  if (entityTypeFilter) activeFilters.push({ label: `Entity: ${entityTypeFilter}`, clear: () => setEntityTypeFilter(null) });
  if (uploaderFilter) {
    const u = getUserById(uploaderFilter);
    activeFilters.push({ label: `Uploader: ${u?.name ?? uploaderFilter}`, clear: () => setUploaderFilter(null) });
  }

  const filtered = useMemo(() => {
    return allDocs.filter(d => {
      if (search && !d.filename.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter && d.type !== typeFilter) return false;
      if (entityTypeFilter && d.entity_type !== entityTypeFilter) return false;
      if (uploaderFilter && d.uploader !== uploaderFilter) return false;
      return true;
    });
  }, [allDocs, search, typeFilter, entityTypeFilter, uploaderFilter]);

  const previewIndex = previewDoc ? filtered.findIndex(d => d.id === previewDoc.id) : -1;
  const canPrev = previewIndex > 0;
  const canNext = previewIndex >= 0 && previewIndex < filtered.length - 1;

  function handleDelete(id: string) {
    setAllDocs(prev => prev.filter(d => d.id !== id));
    toast.success("Document deleted");
  }

  function handleUpload() {
    const newDoc: DocFile = {
      id: `d${Date.now()}`,
      filename: `New_Document_${Date.now().toString(36)}.pdf`,
      type: uploadDocType as DocFile["type"],
      uploader: "u1",
      upload_date: new Date().toISOString().split("T")[0],
      entity_type: (uploadLinkedType || "lead") as DocFile["entity_type"],
      entity_id: uploadLinkedId || "l1",
      size: "1.0 MB",
    };
    setAllDocs(prev => [newDoc, ...prev]);
    setShowUploadModal(false);
    toast.success("Document uploaded successfully");
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-bold text-foreground">Documents</h1>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search by filename..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <button onClick={() => setShowUploadModal(true)} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Upload className="h-4 w-4" /> Upload Document
          </button>
        </div>

        {/* Filters + View Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <select value={typeFilter ?? ""} onChange={e => setTypeFilter(e.target.value || null)}
            className="h-8 px-3 rounded-md bg-secondary border border-border text-sm text-foreground">
            <option value="">All Types</option>
            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={entityTypeFilter ?? ""} onChange={e => setEntityTypeFilter(e.target.value || null)}
            className="h-8 px-3 rounded-md bg-secondary border border-border text-sm text-foreground">
            <option value="">All Entities</option>
            {ENTITY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select value={uploaderFilter ?? ""} onChange={e => setUploaderFilter(e.target.value || null)}
            className="h-8 px-3 rounded-md bg-secondary border border-border text-sm text-foreground">
            <option value="">All Uploaders</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <div className="ml-auto flex items-center border border-border rounded-md overflow-hidden">
            <button onClick={() => setView("grid")} className={`h-8 w-8 flex items-center justify-center transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView("list")} className={`h-8 w-8 flex items-center justify-center transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                {f.label}
                <button onClick={f.clear} className="hover:text-foreground"><X className="h-3 w-3" /></button>
              </span>
            ))}
            <button onClick={() => { setTypeFilter(null); setEntityTypeFilter(null); setUploaderFilter(null); }}
              className="text-xs text-muted-foreground hover:text-foreground">Clear all</button>
          </div>
        )}

        {/* Content */}
        {filtered.length === 0 ? (
          <EmptyState icon={<FileText className="h-10 w-10" />} title="No documents uploaded yet" description="Upload your first file" />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map(d => {
              const uploader = getUserById(d.uploader);
              return (
                <div key={d.id} onClick={() => setPreviewDoc(d)}
                  className="group bg-card border border-border rounded-lg p-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all cursor-pointer">
                  <div className="h-20 bg-secondary rounded-md flex items-center justify-center mb-3">
                    {getFileIcon(d.type)}
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{d.filename}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusBadge variant="outline">{d.type}</StatusBadge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{uploader?.name}</span>
                    <span className="text-xs text-muted-foreground">{d.upload_date}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toast.success("Download started"); }}
                    className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 h-7 w-7 flex items-center justify-center rounded-md bg-secondary text-muted-foreground hover:text-foreground transition-opacity">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Filename</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Uploader</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Linked Entity</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => {
                  const uploader = getUserById(d.uploader);
                  return (
                    <tr key={d.id} onClick={() => setPreviewDoc(d)}
                      className={`border-b border-border hover:bg-secondary/40 transition-colors cursor-pointer group ${i % 2 === 1 ? "bg-secondary/10" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getFileIcon(d.type)}
                          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">{d.filename}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge variant="outline">{d.type}</StatusBadge></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{uploader?.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{d.upload_date}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground truncate max-w-[160px]">{getLinkedEntityName(d)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); toast.success("Download started"); }} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground">
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(d.id); }} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setPreviewDoc(null)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground truncate">{previewDoc.filename}</h2>
              <button onClick={() => setPreviewDoc(null)} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 min-h-[300px]">
              <div className="text-center space-y-4">
                {getFileIcon(previewDoc.type)}
                <p className="text-muted-foreground text-sm">Preview not available for this file type</p>
                <p className="text-xs text-muted-foreground">{previewDoc.size} • Uploaded {previewDoc.upload_date}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <button disabled={!canPrev} onClick={() => setPreviewDoc(filtered[previewIndex - 1])}
                  className="h-8 w-8 flex items-center justify-center rounded-md bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button disabled={!canNext} onClick={() => setPreviewDoc(filtered[previewIndex + 1])}
                  className="h-8 w-8 flex items-center justify-center rounded-md bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="text-xs text-muted-foreground">{previewIndex + 1} of {filtered.length}</span>
              </div>
              <button onClick={() => toast.success("Download started")} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
                <Download className="h-4 w-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setShowUploadModal(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-foreground font-medium">Drag files here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, JPG, PNG up to 25MB</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Document Type</label>
                <select value={uploadDocType} onChange={e => setUploadDocType(e.target.value)}
                  className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground">
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Link to (optional)</label>
                <div className="flex gap-2">
                  <select value={uploadLinkedType} onChange={e => setUploadLinkedType(e.target.value)}
                    className="h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground">
                    <option value="">None</option>
                    {ENTITY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                  <input type="text" placeholder="Entity ID" value={uploadLinkedId} onChange={e => setUploadLinkedId(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button onClick={() => setShowUploadModal(false)} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleUpload} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Upload</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
