import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryClient";
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
    queryKey: queryKeys.meetings.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as DbMeeting[];
    },
    enabled: !!user,
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (meeting: Partial<DbMeeting>) => {
      const { data, error } = await supabase
        .from("meetings")
        .insert({ ...meeting, user_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DbMeeting;
    },
    onSuccess: (created) => {
      qc.setQueryData<DbMeeting[]>(queryKeys.meetings.all, (prev = []) => {
        const next = [...prev, created];
        next.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
        return next;
      });
      toast.success("Meeting scheduled");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("meetings").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.meetings.all });
      const prev = qc.getQueryData<DbMeeting[]>(queryKeys.meetings.all);
      if (prev) qc.setQueryData<DbMeeting[]>(queryKeys.meetings.all, prev.filter((m) => m.id !== id));
      return { prev };
    },
    onError: (e: Error, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.meetings.all, ctx.prev);
      toast.error(e.message);
    },
    onSuccess: () => toast.success("Meeting deleted"),
  });
}
