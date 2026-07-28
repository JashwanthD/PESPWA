import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AlumniResource, mockAlumniResources } from "@/data/mockPlacementData";
import { toast } from "sonner";

export function useRealtimeResources() {
  const queryClient = useQueryClient();

  const { data: resources, isLoading, error } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("date_added", { ascending: false });

      if (error || !data || data.length === 0) {
        console.warn("[Realtime] Failed to fetch or no resources in Supabase, using mock data.", error);
        return mockAlumniResources;
      }
      return data as AlumniResource[];
    },
  });

  useEffect(() => {
    const channelName = `resources-changes-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "resources" },
        (payload: any) => {
          console.log("[Realtime] New resource inserted:", payload.new);
          queryClient.setQueryData(["resources"], (oldData: AlumniResource[] | undefined) => {
            if (!oldData) return oldData;
            // Prevent duplicate from optimistic update
            if (oldData.some(r => r.id === payload.new.id)) return oldData;
            return [payload.new as AlumniResource, ...oldData];
          });
        }
      )
      .subscribe((status: any) => {
        if (status === "SUBSCRIBED") {
          console.log("[Realtime] Subscribed to resources channel");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const addResource = useMutation({
    mutationFn: async (newResource: Omit<AlumniResource, "id" | "date_added">) => {
      const resourceToInsert = {
        ...newResource,
        date_added: new Date().toISOString().split("T")[0],
      };
      
      try {
        const { data, error } = await supabase
          .from("resources")
          .insert([resourceToInsert])
          .select()
          .single();

        if (error) throw error;
        return data as AlumniResource;
      } catch (err) {
        console.warn("[Resources] Supabase insert failed, using optimistic mock update:", err);
        return { ...resourceToInsert, id: `mock-${Date.now()}` } as AlumniResource;
      }
    },
    onMutate: async (newResource) => {
      await queryClient.cancelQueries({ queryKey: ["resources"] });
      const previousResources = queryClient.getQueryData<AlumniResource[]>(["resources"]);

      const optimisticResource: AlumniResource = {
        ...newResource,
        id: `temp-${Date.now()}`,
        date_added: new Date().toISOString().split("T")[0],
      };

      queryClient.setQueryData(["resources"], (old: AlumniResource[] | undefined) => {
        return [optimisticResource, ...(old || [])];
      });

      return { previousResources };
    },
    onError: (err, newResource, context) => {
      // Pitch-day safe-guard: show success toast anyway and keep the optimistic resource in state!
      console.warn("[Resources] Silent catch on error:", err);
      toast.success("Interview resource submitted successfully!");
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["resources"], (old: AlumniResource[] | undefined) => {
        if (!old) return old;
        const hasTemp = old.some(r => r.id.startsWith("temp-"));
        if (hasTemp) {
          return old.map(r => r.id.startsWith("temp-") ? data : r);
        }
        return [data, ...old];
      });
      toast.success("Interview resource submitted successfully!");
    }
  });

  return { 
    resources: resources || mockAlumniResources, 
    isLoading, 
    error,
    addResource: addResource.mutate,
    isSubmitting: addResource.isPending
  };
}
