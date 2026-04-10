import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import {
  Target, TrendingUp, Clock, UserCheck, CheckCircle2,
  ChevronDown, ExternalLink, MessageSquare, XCircle, Plus,
  Pencil, Trash2, Copy, X
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  redditLeads as initialRedditLeads, redditSources, redditThreads, properties, leads as crmLeads,
  PIPELINE_STAGES, users,
  type RedditLead, type RedditSource, type RedditThread, type Lead
} from "@/data/mockData";
import { toast } from "sonner";

function confidenceBadge(score: number) {
  const pct = Math.round(score * 100);
  if (score >= 0.8) return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{pct}%</Badge>;
  if (score >= 0.6) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{pct}%</Badge>;
  return <Badge variant="secondary">{pct}%</Badge>;
}

function sentimentBadge(s: string) {
  switch (s) {
    case "positive": return <StatusBadge variant="success">Positive</StatusBadge>;
    case "negative": return <StatusBadge variant="destructive">Negative</StatusBadge>;
    default: return <StatusBadge variant="outline">Neutral</StatusBadge>;
  }
}

function getThread(id: string) {
  return redditThreads.find(t => t.id === id);
}

function getProperty(id: string | null) {
  if (!id) return null;
  return properties.find(p => p.id === id);
}

/* ───── Create Lead Modal ───── */
interface CreateLeadFormData {
  contactName: string;
  email: string;
  phone: string;
  source: string;
  stage: string;
  notes: string;
  propertyId: string;
  assignedUser: string;
  estimatedValue: string;
}

function buildInitialForm(lead: RedditLead): CreateLeadFormData {
  const thread = getThread(lead.thread_id);
  const prop = getProperty(lead.matched_property_id);
  const username = thread?.author ?? "Unknown";

  const notes = [
    `Reddit Post: ${thread?.title ?? ""}`,
    `URL: ${thread?.url ?? ""}`,
    "",
    "--- AI Summary ---",
    lead.ai_summary,
    "",
    "--- Original Post ---",
    thread?.body ?? "",
    ...(prop ? ["", "--- Matched Property ---", `${prop.address}, ${prop.city} ${prop.state} ${prop.zip}`, `Asking: $${prop.asking_price.toLocaleString()} | ARV: $${prop.arv.toLocaleString()}`] : []),
  ].join("\n");

  return {
    contactName: `Reddit User - ${username}`,
    email: "",
    phone: "",
    source: `Reddit - ${thread?.subreddit ?? "unknown"}`,
    stage: "new",
    notes,
    propertyId: lead.matched_property_id ?? "",
    assignedUser: "u1",
    estimatedValue: "0",
  };
}

/* ───── Lead Card ───── */
function LeadCard({
  lead,
  showContacted,
  onCreateLead,
  onContact,
  onIgnore,
}: {
  lead: RedditLead;
  showContacted?: boolean;
  onCreateLead?: (lead: RedditLead) => void;
  onContact?: (lead: RedditLead) => void;
  onIgnore?: (lead: RedditLead) => void;
}) {
  const thread = getThread(lead.thread_id);
  const prop = getProperty(lead.matched_property_id);
  if (!thread) return null;

  const handleCopyOutreach = () => {
    if (!lead.outreach_message) return;
    navigator.clipboard.writeText(lead.outreach_message).then(() => {
      toast.success("Outreach message copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy message");
    });
  };

  return (
    <Card className="bg-card border-border hover:border-primary/40 transition-colors">
      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <a href={thread.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5">
              {thread.title} <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
            <p className="text-xs text-muted-foreground mt-0.5">{thread.subreddit} · {thread.author}</p>
          </div>
          {confidenceBadge(lead.confidence_score)}
        </div>

        {/* Snippet */}
        <p className="text-xs text-muted-foreground line-clamp-2">{thread.body}</p>

        {/* AI Summary */}
        <div className="bg-primary/5 border border-primary/10 rounded-md p-3">
          <p className="text-xs font-medium text-primary mb-1">AI Analysis</p>
          <p className="text-xs text-muted-foreground">{lead.ai_summary}</p>
        </div>

        {/* Matched Property */}
        {prop && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Matched Property:</span>
            {prop.address}, {prop.city} · ${prop.asking_price.toLocaleString()}
          </div>
        )}

        {/* Contacted timestamp */}
        {showContacted && lead.contacted_at && (
          <p className="text-xs text-muted-foreground">Contacted: {new Date(lead.contacted_at).toLocaleDateString()}</p>
        )}

        {/* Outreach */}
        {lead.outreach_message && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium">
              <MessageSquare className="h-3 w-3" /> Draft Outreach <ChevronDown className="h-3 w-3" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 bg-muted/30 rounded-md p-3">
              <p className="text-xs text-muted-foreground italic">{lead.outreach_message}</p>
              <Button size="sm" variant="ghost" className="mt-2 h-7 text-xs" onClick={handleCopyOutreach}>
                <Copy className="h-3 w-3 mr-1" /> Copy Outreach Message
              </Button>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Actions */}
        {lead.status === "pending" && (
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" onClick={() => onCreateLead?.(lead)}>
              <Plus className="h-3 w-3 mr-1" /> Create Lead in CRM
            </Button>
            <Button size="sm" variant="outline" onClick={() => onContact?.(lead)}>
              <UserCheck className="h-3 w-3 mr-1" /> Contact
            </Button>
            <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => onIgnore?.(lead)}>
              <XCircle className="h-3 w-3 mr-1" /> Ignore
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ───── Main Page ───── */
export default function LeadHunt() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<"confidence" | "date">("confidence");
  const [sources, setSources] = useState<RedditSource[]>(redditSources);

  // Source modal state
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<RedditSource | null>(null);
  const [sourceForm, setSourceForm] = useState({ subreddit: "", keywords: [] as string[], frequency: "daily", active: true });
  const [keywordInput, setKeywordInput] = useState("");
  const [sourceErrors, setSourceErrors] = useState<{ subreddit?: string; keywords?: string }>({});

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Stateful reddit leads
  const [allRedditLeads, setAllRedditLeads] = useState<RedditLead[]>(initialRedditLeads);

  // Create Lead modal
  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const [selectedRedditLead, setSelectedRedditLead] = useState<RedditLead | null>(null);
  const [formData, setFormData] = useState<CreateLeadFormData>({
    contactName: "", email: "", phone: "", source: "", stage: "new",
    notes: "", propertyId: "", assignedUser: "u1", estimatedValue: "0",
  });

  const pending = useMemo(() => {
    const items = allRedditLeads.filter(l => l.status === "pending");
    return items.sort((a, b) => sortBy === "confidence" ? b.confidence_score - a.confidence_score : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [sortBy, allRedditLeads]);

  const contacted = allRedditLeads.filter(l => l.status === "contacted");
  const converted = allRedditLeads.filter(l => l.status === "converted");

  const stats = [
    { label: "Total Leads Found", value: allRedditLeads.length, icon: Target },
    { label: "Pending Review", value: pending.length, icon: Clock },
    { label: "Contacted", value: contacted.length, icon: UserCheck },
    { label: "Converted", value: converted.length, icon: CheckCircle2 },
  ];

  function handleOpenCreateLead(lead: RedditLead) {
    setSelectedRedditLead(lead);
    setFormData(buildInitialForm(lead));
    setCreateLeadOpen(true);
  }

  function handleContactLead(lead: RedditLead) {
    setAllRedditLeads(prev => prev.map(l =>
      l.id === lead.id ? { ...l, status: "contacted" as const, contacted_at: new Date().toISOString() } : l
    ));
    toast.success("Marked as contacted");
  }

  function handleIgnoreLead(lead: RedditLead) {
    setAllRedditLeads(prev => prev.map(l =>
      l.id === lead.id ? { ...l, status: "ignored" as const } : l
    ));
    toast("Lead ignored");
  }

  function handleSubmitCreateLead() {
    if (!selectedRedditLead || !formData.contactName) return;

    // Generate new lead ID
    const newLeadId = `l-reddit-${Date.now()}`;

    // Create the CRM lead (in real app this would be a DB insert)
    const newLead: Lead = {
      id: newLeadId,
      title: `Reddit Lead - ${formData.contactName}`,
      stage: formData.stage as any,
      priority: "Medium",
      source: formData.source,
      estimated_value: Number(formData.estimatedValue) || 0,
      next_follow_up: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      tags: ["Reddit", "LeadHunt"],
      contact_id: "", // would be created/linked in real app
      property_id: formData.propertyId || null,
      assigned_user: formData.assignedUser,
      created_at: new Date().toISOString(),
    };

    // Push to mock leads array (for demo purposes)
    crmLeads.push(newLead);

    // Update reddit lead status
    setAllRedditLeads(prev => prev.map(l =>
      l.id === selectedRedditLead.id
        ? { ...l, status: "contacted" as const, contacted_at: new Date().toISOString() }
        : l
    ));

    setCreateLeadOpen(false);
    setSelectedRedditLead(null);
    toast.success("Lead created! Added to CRM pipeline");

    // Navigate to leads page (in real app would go to specific lead detail)
    setTimeout(() => navigate(`/leads`), 500);
  }

  function openSourceModal(source?: RedditSource) {
    if (source) {
      setEditingSource(source);
      setSourceForm({
        subreddit: source.subreddit.replace(/^r\//, ""),
        keywords: [...source.keywords],
        frequency: source.scan_frequency,
        active: source.active,
      });
    } else {
      setEditingSource(null);
      setSourceForm({ subreddit: "", keywords: [], frequency: "daily", active: true });
    }
    setKeywordInput("");
    setSourceErrors({});
    setSourceModalOpen(true);
  }

  function addKeyword() {
    const kw = keywordInput.trim();
    if (!kw || sourceForm.keywords.includes(kw)) return;
    setSourceForm(p => ({ ...p, keywords: [...p.keywords, kw] }));
    setKeywordInput("");
    setSourceErrors(p => ({ ...p, keywords: undefined }));
  }

  function removeKeyword(kw: string) {
    setSourceForm(p => ({ ...p, keywords: p.keywords.filter(k => k !== kw) }));
  }

  function handleSaveSource() {
    const errors: typeof sourceErrors = {};
    if (!sourceForm.subreddit.trim()) errors.subreddit = "Subreddit is required";
    if (sourceForm.keywords.length === 0) errors.keywords = "At least 1 keyword is required";
    if (Object.keys(errors).length) { setSourceErrors(errors); return; }

    const sub = sourceForm.subreddit.startsWith("r/") ? sourceForm.subreddit : `r/${sourceForm.subreddit}`;

    if (editingSource) {
      setSources(prev => prev.map(s => s.id === editingSource.id ? {
        ...s,
        subreddit: sub,
        keywords: sourceForm.keywords,
        scan_frequency: sourceForm.frequency as any,
        active: sourceForm.active,
      } : s));
      toast.success("Source updated");
    } else {
      const src: RedditSource = {
        id: `rs-${Date.now()}`,
        subreddit: sub,
        keywords: sourceForm.keywords,
        scan_frequency: sourceForm.frequency as any,
        last_scanned: new Date().toISOString(),
        active: sourceForm.active,
        created_at: new Date().toISOString(),
      };
      setSources(prev => [...prev, src]);
      toast.success("Source added");
    }
    setSourceModalOpen(false);
  }

  function confirmDeleteSource(id: string) {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  }

  function executeDeleteSource() {
    if (deleteTargetId) {
      setSources(prev => prev.filter(s => s.id !== deleteTargetId));
      toast("Source deleted");
    }
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
  }

  const updateField = (field: keyof CreateLeadFormData, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <AppLayout>
      <div className="space-y-8 max-w-[1200px]">
          {/* Page Header */}
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">LeadHunt</h1>
            <p className="text-sm text-muted-foreground mt-1">Find qualified leads from Reddit discussions</p>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className="bg-card border border-border rounded-md p-5">
                <p className="text-xs text-muted-foreground mb-3">{s.label}</p>
                <p className="text-3xl font-semibold text-foreground tracking-tight">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending Leads ({pending.length})</TabsTrigger>
              <TabsTrigger value="contacted">Contacted ({contacted.length})</TabsTrigger>
              <TabsTrigger value="sources">Reddit Sources</TabsTrigger>
              <TabsTrigger value="threads">All Threads</TabsTrigger>
            </TabsList>

            {/* Pending */}
            <TabsContent value="pending" className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
                  <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confidence">Confidence (high → low)</SelectItem>
                    <SelectItem value="date">Date (newest first)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {pending.map(l => (
                  <LeadCard
                    key={l.id}
                    lead={l}
                    onCreateLead={handleOpenCreateLead}
                    onContact={handleContactLead}
                    onIgnore={handleIgnoreLead}
                  />
                ))}
              </div>
              {pending.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <Target className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No pending leads</p>
                  <p className="text-xs">All leads have been reviewed</p>
                </div>
              )}
            </TabsContent>

            {/* Contacted */}
            <TabsContent value="contacted">
              <div className="grid gap-4 md:grid-cols-2">
                {contacted.map(l => (
                  <LeadCard
                    key={l.id}
                    lead={l}
                    showContacted
                    onCreateLead={handleOpenCreateLead}
                    onContact={handleContactLead}
                    onIgnore={handleIgnoreLead}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sources" className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => openSourceModal()}><Plus className="h-3 w-3 mr-1" /> Add Source</Button>
              </div>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subreddit</TableHead>
                      <TableHead>Keywords</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Last Scanned</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sources.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.subreddit}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {s.keywords.map(k => <Badge key={k} variant="secondary" className="text-[10px]">{k}</Badge>)}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-xs">{s.scan_frequency}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(s.last_scanned).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Switch
                            checked={s.active}
                            onCheckedChange={checked => setSources(prev => prev.map(x => x.id === s.id ? { ...x, active: checked } : x))}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openSourceModal(s)}><Pencil className="h-3 w-3" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => confirmDeleteSource(s.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* All Threads */}
            <TabsContent value="threads">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subreddit</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Keywords</TableHead>
                      <TableHead>Sentiment</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead>Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redditThreads.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs">{t.subreddit}</TableCell>
                        <TableCell className="max-w-[250px] truncate text-sm font-medium">{t.title}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {t.matched_keywords.map(k => <Badge key={k} variant="secondary" className="text-[10px]">{k}</Badge>)}
                          </div>
                        </TableCell>
                        <TableCell>{sentimentBadge(t.sentiment)}</TableCell>
                        <TableCell>
                          {t.processed ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell>
                          <a href={t.url} target="_blank" rel="noreferrer">
                            <Button size="icon" variant="ghost" className="h-7 w-7"><ExternalLink className="h-3 w-3" /></Button>
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
      </div>
    </AppLayout>

      {/* Source Modal (Add/Edit) */}
      <Dialog open={sourceModalOpen} onOpenChange={setSourceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSource ? "Edit Reddit Source" : "Add Reddit Source"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subreddit</Label>
              <div className="flex items-center gap-0">
                <span className="inline-flex items-center h-9 px-3 rounded-l-md border border-r-0 border-border bg-muted text-sm text-muted-foreground">r/</span>
                <Input
                  className="rounded-l-none"
                  placeholder="realestate"
                  value={sourceForm.subreddit}
                  onChange={e => { setSourceForm(p => ({ ...p, subreddit: e.target.value })); setSourceErrors(p => ({ ...p, subreddit: undefined })); }}
                />
              </div>
              {sourceErrors.subreddit && <p className="text-xs text-destructive mt-1">{sourceErrors.subreddit}</p>}
            </div>

            <div>
              <Label>Keywords</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a keyword and press Enter"
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                />
                <Button type="button" size="sm" variant="outline" onClick={addKeyword}>Add</Button>
              </div>
              {sourceForm.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sourceForm.keywords.map(kw => (
                    <Badge key={kw} variant="secondary" className="gap-1 pr-1">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {sourceErrors.keywords && <p className="text-xs text-destructive mt-1">{sourceErrors.keywords}</p>}
            </div>

            <div>
              <Label>Scan Frequency</Label>
              <Select value={sourceForm.frequency} onValueChange={v => setSourceForm(p => ({ ...p, frequency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every hour</SelectItem>
                  <SelectItem value="2hours">Every 2 hours</SelectItem>
                  <SelectItem value="6hours">Every 6 hours</SelectItem>
                  <SelectItem value="12hours">Every 12 hours</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={sourceForm.active} onCheckedChange={checked => setSourceForm(p => ({ ...p, active: checked }))} />
            </div>

            {sourceForm.subreddit && (
              <p className="text-xs text-muted-foreground">
                We'll scan <span className="font-medium text-foreground">r/{sourceForm.subreddit}</span> for posts containing these keywords
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSourceModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSource}>{editingSource ? "Save Changes" : "Add Source"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Source Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This won't delete existing leads found from this source.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteSource} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Lead in CRM Modal */}
      <Dialog open={createLeadOpen} onOpenChange={setCreateLeadOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Lead in CRM</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Contact Name</Label>
              <Input value={formData.contactName} onChange={e => updateField("contactName", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input type="email" placeholder="email@example.com" value={formData.email} onChange={e => updateField("email", e.target.value)} />
              </div>
              <div>
                <Label>Phone <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input type="tel" placeholder="(555) 000-0000" value={formData.phone} onChange={e => updateField("phone", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Source</Label>
              <Input value={formData.source} readOnly className="text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pipeline Stage</Label>
                <Select value={formData.stage} onValueChange={v => updateField("stage", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estimated Value ($)</Label>
                <Input type="number" value={formData.estimatedValue} onChange={e => updateField("estimatedValue", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Assigned To</Label>
              <Select value={formData.assignedUser} onValueChange={v => updateField("assignedUser", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {properties.length > 0 && (
              <div>
                <Label>Linked Property</Label>
                <Select value={formData.propertyId || "none"} onValueChange={v => updateField("propertyId", v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No property</SelectItem>
                    {properties.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.address}, {p.city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Notes</Label>
              <Textarea
                rows={8}
                value={formData.notes}
                onChange={e => updateField("notes", e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateLeadOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitCreateLead}>Create Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
