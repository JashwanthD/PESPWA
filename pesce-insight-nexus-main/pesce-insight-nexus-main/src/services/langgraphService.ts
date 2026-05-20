/**
 * langgraphService.ts
 *
 * Connects the frontend to the FastAPI LangGraph backend.
 */

// Use an environment variable or default to localhost for development
const API_BASE_URL = import.meta.env.VITE_LANGGRAPH_API_URL || 'http://localhost:8000';

export interface GenerateRequest {
  company_name: string;
  company_context?: Record<string, any>;
}

export interface RunResponse {
  run_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress_percentage: number;
  progress_stage: string;
  message?: string;
  golden_record?: Record<string, any>;
  failed_fields?: string[];
}

export interface StatusListResponse {
  runs: RunResponse[];
}

/**
 * Starts an asynchronous LangGraph execution for the given company.
 */
export async function generateCompanyRecord(request: GenerateRequest): Promise<RunResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/agent/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to generate company record: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get the status of all active and completed runs.
 */
export async function listRuns(): Promise<StatusListResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/agent/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to list runs: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get the status and output of a specific execution run.
 */
export async function getRunStatus(runId: string): Promise<RunResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/agent/status/${runId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to get run status: ${response.statusText}`);
  }

  return response.json();
}
