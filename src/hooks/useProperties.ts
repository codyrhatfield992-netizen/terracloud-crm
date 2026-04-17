import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";

export interface DbProperty {
  id: string;
  user_id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  property_type: string;
  beds: number;
  baths: number;
  sqft: number;
  arv: number;
  asking_price: number;
  offer_price: number;
  status: string;
  notes: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export function useProperties() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.properties.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DbProperty[];
    },
    enabled: !!user,
  });
}

export function useProperty(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: id ? queryKeys.properties.detail(id) : ["properties", "noop"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as unknown as DbProperty | null;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (p: Partial<DbProperty>) => {
      const { data, error } = await supabase
        .from("properties")
        .insert({ ...p, user_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DbProperty;
    },
    onSuccess: (created) => {
      qc.setQueryData<DbProperty[]>(queryKeys.properties.all, (prev = []) => [created, ...prev]);
      qc.setQueryData(queryKeys.properties.detail(created.id), created);
      toast.success("Property created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbProperty> & { id: string }) => {
      const { data, error } = await supabase
        .from("properties")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DbProperty;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: queryKeys.properties.all });
      await qc.cancelQueries({ queryKey: queryKeys.properties.detail(vars.id) });
      const prevList = qc.getQueryData<DbProperty[]>(queryKeys.properties.all);
      const prevDetail = qc.getQueryData<DbProperty>(queryKeys.properties.detail(vars.id));
      if (prevList) {
        qc.setQueryData<DbProperty[]>(
          queryKeys.properties.all,
          prevList.map((p) => (p.id === vars.id ? { ...p, ...vars } : p)),
        );
      }
      if (prevDetail) {
        qc.setQueryData<DbProperty>(queryKeys.properties.detail(vars.id), { ...prevDetail, ...vars });
      }
      return { prevList, prevDetail };
    },
    onError: (e: Error, vars, ctx) => {
      if (ctx?.prevList) qc.setQueryData(queryKeys.properties.all, ctx.prevList);
      if (ctx?.prevDetail) qc.setQueryData(queryKeys.properties.detail(vars.id), ctx.prevDetail);
      toast.error(e.message);
    },
    onSuccess: (saved) => {
      qc.setQueryData<DbProperty[]>(queryKeys.properties.all, (prev = []) =>
        prev.map((p) => (p.id === saved.id ? saved : p)),
      );
      qc.setQueryData(queryKeys.properties.detail(saved.id), saved);
    },
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.properties.all });
      const prev = qc.getQueryData<DbProperty[]>(queryKeys.properties.all);
      if (prev) qc.setQueryData<DbProperty[]>(queryKeys.properties.all, prev.filter((p) => p.id !== id));
      return { prev };
    },
    onError: (e: Error, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.properties.all, ctx.prev);
      toast.error(e.message);
    },
    onSuccess: (id) => {
      qc.removeQueries({ queryKey: queryKeys.properties.detail(id) });
      toast.success("Property deleted");
    },
  });
}
