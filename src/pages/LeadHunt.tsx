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
  Pencil, Trash2, Copy
} from "lucide-react";
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
  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [newSource, setNewSource] = useState({ subreddit: "", keywords: "", frequency: "daily" as const });

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
    { label: "Total Leads Found", value: allRedditLeads.length, icon: Target, color: "text-primary" },
    { label: "Pending Review", value: pending.length, icon: Clock, color: "text-yellow-400" },
    { label: "Contacted", value: contacted.length, icon: UserCheck, color: "text-blue-400" },
    { label: "Converted", value: converted.length, icon: CheckCircle2, color: "text-emerald-400" },
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

  function handleAddSource() {
    if (!newSource.subreddit) return;
    const src: RedditSource = {
      id: `rs-${Date.now()}`,
      subreddit: newSource.subreddit.startsWith("r/") ? newSource.subreddit : `r/${newSource.subreddit}`,
      keywords: newSource.keywords.split(",").map(k => k.trim()).filter(Boolean),
      scan_frequency: newSource.frequency,
      last_scanned: new Date().toISOString(),
      active: true,
      created_at: new Date().toISOString(),
    };
    setSources(prev => [...prev, src]);
    setNewSource({ subreddit: "", keywords: "", frequency: "daily" });
    setAddSourceOpen(false);
    toast.success("Source added");
  }

  const updateField = (field: keyof CreateLeadFormData, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 ml-60">
        <TopBar />

        <main className="p-6 space-y-6 overflow-y-auto" style={{ height: "calc(100vh - 56px)" }}>
          {/* Page Header */}
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> LeadHunt
            </h1>
            <p className="text-xs text-muted-foreground">Automatically find qualified leads from Reddit discussions</p>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={`h-8 w-8 ${s.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
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

            {/* Sources */}
            <TabsContent value="sources" className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setAddSourceOpen(true)}><Plus className="h-3 w-3 mr-1" /> Add Source</Button>
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
                            <Button size="icon" variant="ghost" className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { setSources(prev => prev.filter(x => x.id !== s.id)); toast("Source deleted"); }}><Trash2 className="h-3 w-3" /></Button>
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
        </main>
      </div>

      {/* Add Source Modal */}
      <Dialog open={addSourceOpen} onOpenChange={setAddSourceOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Reddit Source</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Subreddit</Label><Input placeholder="r/realestate" value={newSource.subreddit} onChange={e => setNewSource(p => ({ ...p, subreddit: e.target.value }))} /></div>
            <div><Label>Keywords (comma-separated)</Label><Input placeholder="investment property, first home" value={newSource.keywords} onChange={e => setNewSource(p => ({ ...p, keywords: e.target.value }))} /></div>
            <div>
              <Label>Scan Frequency</Label>
              <Select value={newSource.frequency} onValueChange={v => setNewSource(p => ({ ...p, frequency: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSourceOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSource}>Add Source</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
