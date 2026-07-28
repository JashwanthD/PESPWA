import { useQuery } from "@tanstack/react-query";
import { getAllCompanies } from "@/services/companyService";
import demoFallbackData from "@/data/demoFallbackData.json";
import { mockPlacementCompanies } from "@/data/mockPlacementData";
import { PESCECompanySchema } from "@/types/intelligence";

export function useCompanyData() {
  const { data: companies = [], isLoading } = useQuery<PESCECompanySchema[]>({
    queryKey: ["companyData"],
    queryFn: async () => {
      // Build our complete set of presentation fallback companies (showcase + old dummy companies)
      const fallbackList = [...(demoFallbackData as PESCECompanySchema[]), ...mockPlacementCompanies];

      // Retrieve locally generated custom companies from localStorage
      let localCustomList: PESCECompanySchema[] = [];
      try {
        const stored = localStorage.getItem("localGeneratedCompanies");
        if (stored) {
          localCustomList = JSON.parse(stored);
        }
      } catch (err) {
        console.warn("[useCompanyData] Failed to parse localGeneratedCompanies:", err);
      }

      // Combine custom list with fallback list
      const baseList = [...localCustomList, ...fallbackList];

      try {
        const data = await getAllCompanies();
        if (!data || data.length === 0) {
          console.warn("[useCompanyData] Database is empty, returning fallback & custom local data.");
          return baseList;
        }

        // Merge DB data, prioritizing baseList at the top to ensure they always show up
        const baseIds = new Set(baseList.map(c => c.company_id));
        const filteredDbData = data.filter(c => !baseIds.has(c.company_id));
        
        return [...baseList, ...filteredDbData];
      } catch (err) {
        console.warn("[useCompanyData] Supabase fetch failed silently, returning fallbacks & custom local data:", err);
        return baseList;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const getCompanyById = (id: string | number | undefined | null) => {
    if (id === undefined || id === null) return null;
    const targetStr = String(id).trim();
    return companies.find(c => String(c.company_id) === targetStr) || null;
  };

  return {
    companies,
    isLoading,
    getCompanyById,
  };
}
