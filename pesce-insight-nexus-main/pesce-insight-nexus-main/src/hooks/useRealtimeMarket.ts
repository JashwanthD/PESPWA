import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const DEFAULT_TECH_STACKS = {
  legacy: { label: "Legacy (COBOL, Java 8, SAP)", growth: 0.04, desc: "4% YoY Growth" },
  standard: { label: "Standard (React, Node, Python)", growth: 0.10, desc: "10% YoY Growth" },
  modern: { label: "Modern/Cloud (LLMs, AWS, Rust)", growth: 0.20, desc: "20% YoY Growth" }
};

export const DEFAULT_CITY_TIERS = {
  tier1: { label: "Tier-1 (High Cost)", cost: 35000, desc: "Metro (BLR, MUM, NCR)" },
  tier2: { label: "Tier-2 (Med Cost)", cost: 18000, desc: "Tier-2 (Pune, HYD, MYS)" },
  tier3: { label: "Tier-3 (Low Cost)", cost: 8000, desc: "Small Towns & Remote" }
};

export function useRealtimeMarket() {
  const queryClient = useQueryClient();

  const { data: marketData, isLoading, error } = useQuery({
    queryKey: ["market_growth_trends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("market_growth_trends")
        .select("*");

      if (error || !data || data.length === 0) {
        console.warn("[Realtime] Failed to fetch market trends, using defaults.", error);
        return { tech_stacks: DEFAULT_TECH_STACKS, city_tiers: DEFAULT_CITY_TIERS };
      }
      
      return {
        tech_stacks: data[0].tech_stacks || DEFAULT_TECH_STACKS,
        city_tiers: data[0].city_tiers || DEFAULT_CITY_TIERS
      };
    },
  });

  useEffect(() => {
    const channelName = `market-changes-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "market_growth_trends" },
        (payload: any) => {
          console.log("[Realtime] Market trends updated:", payload.new);
          queryClient.setQueryData(["market_growth_trends"], () => ({
            tech_stacks: payload.new.tech_stacks || DEFAULT_TECH_STACKS,
            city_tiers: payload.new.city_tiers || DEFAULT_CITY_TIERS
          }));
        }
      )
      .subscribe((status: any) => {
        if (status === "SUBSCRIBED") {
          console.log("[Realtime] Subscribed to market_growth_trends channel");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    techStacks: marketData?.tech_stacks || DEFAULT_TECH_STACKS,
    cityTiers: marketData?.city_tiers || DEFAULT_CITY_TIERS,
    isLoading,
    error
  };
}
