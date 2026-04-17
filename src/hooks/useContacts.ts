import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";

export interface DbContact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  tags: string[];
  source: string;
  created_at: string;
  updated_at: string;
}

export function useContacts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.contacts.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DbContact[];
    },
    enabled: !!user,
  });
}

export function useContact(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: id ? queryKeys.contacts.detail(id) : ["contacts", "noop"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as unknown as DbContact | null;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (contact: Partial<DbContact>) => {
      const { data, error } = await supabase
        .from("contacts")
        .insert({ ...contact, user_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DbContact;
    },
    onSuccess: (created) => {
      qc.setQueryData<DbContact[]>(queryKeys.contacts.all, (prev = []) => [created, ...prev]);
      qc.setQueryData(queryKeys.contacts.detail(created.id), created);
      toast.success("Contact created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbContact> & { id: string }) => {
      const { data, error } = await supabase
        .from("contacts")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DbContact;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: queryKeys.contacts.all });
      await qc.cancelQueries({ queryKey: queryKeys.contacts.detail(vars.id) });
      const prevList = qc.getQueryData<DbContact[]>(queryKeys.contacts.all);
      const prevDetail = qc.getQueryData<DbContact>(queryKeys.contacts.detail(vars.id));
      if (prevList) {
        qc.setQueryData<DbContact[]>(
          queryKeys.contacts.all,
          prevList.map((c) => (c.id === vars.id ? { ...c, ...vars } : c)),
        );
      }
      if (prevDetail) qc.setQueryData<DbContact>(queryKeys.contacts.detail(vars.id), { ...prevDetail, ...vars });
      return { prevList, prevDetail };
    },
    onError: (e: Error, vars, ctx) => {
      if (ctx?.prevList) qc.setQueryData(queryKeys.contacts.all, ctx.prevList);
      if (ctx?.prevDetail) qc.setQueryData(queryKeys.contacts.detail(vars.id), ctx.prevDetail);
      toast.error(e.message);
    },
    onSuccess: (saved) => {
      qc.setQueryData<DbContact[]>(queryKeys.contacts.all, (prev = []) =>
        prev.map((c) => (c.id === saved.id ? saved : c)),
      );
      qc.setQueryData(queryKeys.contacts.detail(saved.id), saved);
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.contacts.all });
      const prev = qc.getQueryData<DbContact[]>(queryKeys.contacts.all);
      if (prev) qc.setQueryData<DbContact[]>(queryKeys.contacts.all, prev.filter((c) => c.id !== id));
      return { prev };
    },
    onError: (e: Error, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.contacts.all, ctx.prev);
      toast.error(e.message);
    },
    onSuccess: (id) => {
      qc.removeQueries({ queryKey: queryKeys.contacts.detail(id) });
      toast.success("Contact deleted");
    },
  });
}
