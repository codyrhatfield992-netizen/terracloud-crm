import { useState, useMemo } from "react";
import { FileText, Search, LayoutGrid, List, Upload, X, Plus } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import EmptyState from "@/components/EmptyState";
import { useDocuments, useCreateDocument, useDeleteDocument } from "@/hooks/useDocuments";
import { Skeleton } from "@/components/ui/skeleton";

export default function Documents() {
  const { data: documents = [], isLoading } = useDocuments();
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return documents;
    return documents.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  }, [documents, search]);

  return (
    <AppLayout>
      <div className="space-y-4">
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

        <div className="flex items-center gap-3">
          <div className="ml-auto flex items-center border border-border rounded-md overflow-hidden">
            <button onClick={() => setView("grid")} className={`h-8 w-8 flex items-center justify-center transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid className="h-4 w-4" /></button>
            <button onClick={() => setView("list")} className={`h-8 w-8 flex items-center justify-center transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}><List className="h-4 w-4" /></button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <Skeleton className="h-20 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<FileText className="h-10 w-10" />} title="No documents yet" description="Upload your first file to get started"
            action={<button onClick={() => setShowUploadModal(true)} className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"><Plus className="h-4 w-4" /> Upload</button>} />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map(d => (
              <div key={d.id} className="group bg-card border border-border rounded-lg p-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all">
                <div className="h-20 bg-secondary rounded-md flex items-center justify-center mb-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{d.file_type} · {new Date(d.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d.id} className={`border-b border-border hover:bg-secondary/40 transition-colors ${i % 2 === 1 ? "bg-secondary/10" : ""}`}>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{d.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{d.file_type}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-foreground font-medium">Drag files here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, JPG, PNG up to 25MB</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border">
              <button onClick={() => setShowUploadModal(false)} className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={() => { createDocument.mutate({ name: `Document_${Date.now().toString(36)}.pdf`, file_type: "PDF", size: 0 }); setShowUploadModal(false); }}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Upload</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
