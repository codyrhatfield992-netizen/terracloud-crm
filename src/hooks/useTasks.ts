import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";

export interface DbTask {
  id: string;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;
  due_date: string | null;
  priority: string;
  related_entity_type: string;
  related_entity_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useTasks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DbTask[];
    },
    enabled: !!user,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (task: Partial<DbTask>) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...task, user_id: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DbTask;
    },
    onSuccess: (created) => {
      qc.setQueryData<DbTask[]>(queryKeys.tasks.all, (prev = []) => [created, ...prev]);
      toast.success("Task created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbTask> & { id: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DbTask;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: queryKeys.tasks.all });
      const prev = qc.getQueryData<DbTask[]>(queryKeys.tasks.all);
      if (prev) {
        qc.setQueryData<DbTask[]>(
          queryKeys.tasks.all,
          prev.map((t) => (t.id === vars.id ? { ...t, ...vars } : t)),
        );
      }
      return { prev };
    },
    onError: (e: Error, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.tasks.all, ctx.prev);
      toast.error(e.message);
    },
    onSuccess: (saved) => {
      qc.setQueryData<DbTask[]>(queryKeys.tasks.all, (prev = []) =>
        prev.map((t) => (t.id === saved.id ? saved : t)),
      );
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.tasks.all });
      const prev = qc.getQueryData<DbTask[]>(queryKeys.tasks.all);
      if (prev) qc.setQueryData<DbTask[]>(queryKeys.tasks.all, prev.filter((t) => t.id !== id));
      return { prev };
    },
    onError: (e: Error, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.tasks.all, ctx.prev);
      toast.error(e.message);
    },
    onSuccess: () => toast.success("Task deleted"),
  });
}
