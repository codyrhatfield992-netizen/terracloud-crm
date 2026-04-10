import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as DbDocument[];
    },
    enabled: !!user,
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (doc: Partial<DbDocument>) => {
      const { data, error } = await supabase.from("documents").insert({ ...doc, user_id: user!.id } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents"] }); toast.success("Document uploaded"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents"] }); toast.success("Document deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
