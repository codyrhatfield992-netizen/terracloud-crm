import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface DbMeeting {
  id: string;
  user_id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  notes: string;
  attendees: string[];
  created_at: string;
  updated_at: string;
}

export function useMeetings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("meetings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as DbMeeting[];
    },
    enabled: !!user,
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (meeting: Partial<DbMeeting>) => {
      const { data, error } = await supabase.from("meetings").insert({ ...meeting, user_id: user!.id } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["meetings"] }); toast.success("Meeting scheduled"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("meetings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["meetings"] }); toast.success("Meeting deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
