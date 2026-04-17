import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";

export interface DbDocument {
  id: string;
  user_id: string;
  name: string;
  file_type: string;
  size: number;
  entity_type: string;
  entity_id: string | null;
  url: string;
  created_at: string;
  updated_at: string;
}

export function useDocuments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.documents.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DbDocument[];
    },
    enabled: !!user,
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (doc: Partial<DbDocument>) => {
      const { data, error } = await supabase
        .from("documents")
        .insert({ ...doc, user_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DbDocument;
    },
    onSuccess: (created) => {
      qc.setQueryData<DbDocument[]>(queryKeys.documents.all, (prev = []) => [created, ...prev]);
      toast.success("Document added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.documents.all });
      const prev = qc.getQueryData<DbDocument[]>(queryKeys.documents.all);
      if (prev) qc.setQueryData<DbDocument[]>(queryKeys.documents.all, prev.filter((d) => d.id !== id));
      return { prev };
    },
    onError: (e: Error, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.documents.all, ctx.prev);
      toast.error(e.message);
    },
    onSuccess: () => toast.success("Document deleted"),
  });
}
