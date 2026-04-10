import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as DbProperty[];
    },
    enabled: !!user,
  });
}

export function useProperty(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["properties", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as unknown as DbProperty;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (p: Partial<DbProperty>) => {
      const { data, error } = await supabase.from("properties").insert({ ...p, user_id: user!.id } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["properties"] }); toast.success("Property created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbProperty> & { id: string }) => {
      const { error } = await supabase.from("properties").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["properties"] }); toast.success("Property updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["properties"] }); toast.success("Property deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
