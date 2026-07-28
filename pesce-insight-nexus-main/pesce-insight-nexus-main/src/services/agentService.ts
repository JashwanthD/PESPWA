import { useState } from "react";

// In dev: Vite proxies /api → http://127.0.0.1:8001
// In Docker/prod: Nginx proxies /api → http://backend:8001
const API_BASE_URL = "/api";

export interface GenerateRequest {
  company_name: string;
  company_context?: Record<string, any>;
}

export interface RunResponse {
  run_id: string;
  status: "queued" | "running" | "completed" | "failed";
  progress_percentage: number;
  progress_stage: string;
  message?: string;
  golden_record?: Record<string, any>;
  failed_fields?: string[];
}

import { supabase } from "@/lib/supabase";

export async function startCompanyGeneration(request: GenerateRequest): Promise<RunResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/agent/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errMsg = "Failed to start generation";
    try {
      const error = await response.json();
      errMsg = error.message || error.detail || errMsg;
    } catch {
      try {
        const text = await response.text();
        if (text) errMsg = text.slice(0, 150);
      } catch {}
    }
    throw new Error(errMsg);
  }

  try {
    return await response.json();
  } catch (e: any) {
    throw new Error(`Invalid JSON response: ${e.message}`);
  }
}

export async function getRunStatus(runId: string): Promise<RunResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/agent/status/${runId}`);

  if (!response.ok) {
    let errMsg = "Failed to fetch run status";
    try {
      const error = await response.json();
      errMsg = error.message || error.detail || errMsg;
    } catch {
      try {
        const text = await response.text();
        if (text) errMsg = text.slice(0, 150);
      } catch {}
    }
    throw new Error(errMsg);
  }

  try {
    return await response.json();
  } catch (e: any) {
    throw new Error(`Invalid JSON response: ${e.message}`);
  }
}
