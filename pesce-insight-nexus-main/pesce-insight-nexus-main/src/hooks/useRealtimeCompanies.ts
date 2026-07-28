import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PESCECompanySchema } from "@/types/intelligence";
import { mockPlacementCompanies } from "@/data/mockPlacementData";
import { getAllCompanies } from "@/services/companyService";

export function useRealtimeCompanies() {
  const queryClient = useQueryClient();

  const { data: companies, isLoading, error } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const data = await getAllCompanies();

      if (!data || data.length === 0) {
        console.warn("[Realtime] Failed to fetch companies via getAllCompanies, falling back to mock data.");
        return mockPlacementCompanies;
      }

      // Prioritize the highly-detailed mock/dummy companies for presentation
      const mockIds = new Set(mockPlacementCompanies.map(c => c.company_id));
      const filteredData = data.filter(c => !mockIds.has(c.company_id));
      const combinedData = [...mockPlacementCompanies, ...filteredData];

      // DEMO INJECTION: Ensure at least the first 3 companies have active application URLs for testing
      const processedData = combinedData.map((company, index) => {
        if (index < 3 && !company.application_url) {
          return {
            ...company,
            application_url: `https://careers.${(company.short_name || 'example').toLowerCase()}.com/jobs`
          };
        }
        return company;
      });

      return processedData;
    },
  });

  useEffect(() => {
    const channelName = `companies-changes-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "companies" },
        (payload: any) => {
          console.log("[Realtime] Company updated:", payload.new);
          queryClient.setQueryData(["companies"], (oldData: PESCECompanySchema[] | undefined) => {
            if (!oldData) return oldData;
            return oldData.map((company) =>
              company.company_id === payload.new.company_id
                ? { ...company, ...payload.new }
                : company
            );
          });
        }
      )
      .subscribe((status: any) => {
        if (status === "SUBSCRIBED") {
          console.log("[Realtime] Subscribed to companies channel");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { companies: companies || mockPlacementCompanies, isLoading, error };
}
