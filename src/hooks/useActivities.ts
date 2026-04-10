import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DbActivity {
  id: string;
  user_id: string;
  type: string;
  description: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
}

export function useActivities(limit = 20) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["activities", limit],
    queryFn: async () => {
      const { data, error } = await supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(limit);
      if (error) throw error;
      return data as unknown as DbActivity[];
    },
    enabled: !!user,
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (activity: Partial<DbActivity>) => {
      const { error } = await supabase.from("activities").insert({ ...activity, user_id: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["activities"] }); },
  });
}
