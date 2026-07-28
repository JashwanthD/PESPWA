import { useEffect, useState } from "react";
import type { PESCECompanySchema } from "@/types/intelligence";
import {
  getAllCompanies,
  fetchIntelligenceCompanyById,
  fetchHiringJsonByCompanyId,
} from "@/services/companyService";

interface State<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useCompanyIntelligence() {
  const [state, setState] = useState<State<PESCECompanySchema[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    getAllCompanies()
      .then((data) => mounted && setState({ data, loading: false, error: null }))
      .catch((error) => mounted && setState({ data: null, loading: false, error }));
    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

export function useCompanyById(id: number | null) {
  const [state, setState] = useState<State<PESCECompanySchema>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (id == null) return;
    let mounted = true;
    setState({ data: null, loading: true, error: null });

    const fetchMergedData = async () => {
      try {
        const [ms1Data, ms2Json] = await Promise.all([
          fetchIntelligenceCompanyById(id),
          fetchHiringJsonByCompanyId(id),
        ]);

        let finalCompanyData = ms1Data;
        
        // If not found in database, check localStorage custom companies
        if (!finalCompanyData) {
          try {
            const stored = localStorage.getItem("localGeneratedCompanies");
            if (stored) {
              const customCompanies = JSON.parse(stored);
              const found = customCompanies.find((c: any) => Number(c.company_id) === Number(id));
              if (found) {
                finalCompanyData = found;
              }
            }
          } catch (e) {
            console.warn("Error parsing localGeneratedCompanies in useCompanyById:", e);
          }
        }

        if (!finalCompanyData) {
          throw new Error("Company not found in Intelligence Database");
        }

        // Rule: If a fetch fails or data is null, provide a fallback to prevent UI crashes.
        // We merged it to job_role_details schema key.
        const mergedCompany: PESCECompanySchema = {
          ...finalCompanyData,
          job_role_details: ms2Json || { fallback_status: "N/A" },
        };

        if (mounted) {
          setState({ data: mergedCompany, loading: false, error: null });
        }
      } catch (error: any) {
        if (mounted) {
          setState({ data: null, loading: false, error });
        }
      }
    };

    fetchMergedData();

    return () => {
      mounted = false;
    };
  }, [id]);

  return state;
}
