import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";

export interface DbLead {
  id: string;
  user_id: string;
  title: string;
  stage: string;
  priority: string;
  source: string;
  estimated_value: number;
  next_follow_up: string | null;
  tags: string[];
  contact_id: string | null;
  property_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useLeads() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.leads.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DbLead[];
    },
    enabled: !!user,
  });
}

export function useLead(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: id ? queryKeys.leads.detail(id) : ["leads", "noop"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as unknown as DbLead | null;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (lead: Partial<DbLead>) => {
      const { data, error } = await supabase
        .from("leads")
        .insert({ ...lead, user_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DbLead;
    },
    onSuccess: (created) => {
      // Direct cache update -> no extra round-trip, no flicker.
      qc.setQueryData<DbLead[]>(queryKeys.leads.all, (prev = []) => [created, ...prev]);
      qc.setQueryData(queryKeys.leads.detail(created.id), created);
      toast.success("Lead created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbLead> & { id: string }) => {
      const { data, error } = await supabase
        .from("leads")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DbLead;
    },
    // Optimistic update: UI moves the card instantly when stage changes.
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: queryKeys.leads.all });
      await qc.cancelQueries({ queryKey: queryKeys.leads.detail(vars.id) });
      const prevList = qc.getQueryData<DbLead[]>(queryKeys.leads.all);
      const prevDetail = qc.getQueryData<DbLead>(queryKeys.leads.detail(vars.id));
      if (prevList) {
        qc.setQueryData<DbLead[]>(
          queryKeys.leads.all,
          prevList.map((l) => (l.id === vars.id ? { ...l, ...vars } : l)),
        );
      }
      if (prevDetail) {
        qc.setQueryData<DbLead>(queryKeys.leads.detail(vars.id), { ...prevDetail, ...vars });
      }
      return { prevList, prevDetail };
    },
    onError: (e: Error, vars, ctx) => {
      // Rollback
      if (ctx?.prevList) qc.setQueryData(queryKeys.leads.all, ctx.prevList);
      if (ctx?.prevDetail) qc.setQueryData(queryKeys.leads.detail(vars.id), ctx.prevDetail);
      toast.error(e.message);
    },
    onSuccess: (saved) => {
      // Reconcile with server-truth.
      qc.setQueryData<DbLead[]>(queryKeys.leads.all, (prev = []) =>
        prev.map((l) => (l.id === saved.id ? saved : l)),
      );
      qc.setQueryData(queryKeys.leads.detail(saved.id), saved);
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.leads.all });
      const prev = qc.getQueryData<DbLead[]>(queryKeys.leads.all);
      if (prev) qc.setQueryData<DbLead[]>(queryKeys.leads.all, prev.filter((l) => l.id !== id));
      return { prev };
    },
    onError: (e: Error, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.leads.all, ctx.prev);
      toast.error(e.message);
    },
    onSuccess: (id) => {
      qc.removeQueries({ queryKey: queryKeys.leads.detail(id) });
      toast.success("Lead deleted");
    },
  });
}
