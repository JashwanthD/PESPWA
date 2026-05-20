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

export async function startCompanyGeneration(request: GenerateRequest): Promise<RunResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/agent/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to start generation");
  }

  return response.json();
}

export async function getRunStatus(runId: string): Promise<RunResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/agent/status/${runId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch run status");
  }

  return response.json();
}
