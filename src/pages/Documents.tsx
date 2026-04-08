import { useState } from "react";
import { FileText, Search, LayoutGrid, List } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { documents, getUserById } from "@/data/mockData";

const typeIcon: Record<string, string> = { PDF: "📄", Image: "🖼️", Contract: "📝", Spreadsheet: "📊", Other: "📁" };

export default function Documents() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");

  const filtered = documents.filter(d => d.filename.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">{documents.length} documents</p>
          </div>
          <button className="h-9 px-4 flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Upload Document
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button onClick={() => setView("grid")} className={`h-9 w-9 flex items-center justify-center transition-colors ${view === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView("list")} className={`h-9 w-9 flex items-center justify-center transition-colors ${view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {view === "list" ? (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Filename</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Uploader</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Size</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => {
                  const uploader = getUserById(d.uploader);
                  return (
                    <tr key={d.id} className={`border-b border-border hover:bg-secondary/30 transition-colors cursor-pointer ${i % 2 === 1 ? "bg-secondary/10" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{typeIcon[d.type] ?? "📁"}</span>
                          <span className="text-sm font-medium text-foreground">{d.filename}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge variant="outline">{d.type}</StatusBadge></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{uploader?.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{d.upload_date}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{d.size}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(d => {
              const uploader = getUserById(d.uploader);
              return (
                <div key={d.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="h-20 bg-secondary rounded-md flex items-center justify-center text-2xl mb-3">{typeIcon[d.type] ?? "📁"}</div>
                  <p className="text-sm font-medium text-foreground truncate">{d.filename}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{d.size}</span>
                    <span className="text-xs text-muted-foreground">{d.upload_date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
