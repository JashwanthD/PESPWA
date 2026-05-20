// Simple singleton for portal search state persistence
// used to keep search queries in sync when switching tabs.

interface PortalState {
  hiringQuery: string;
  innovxQuery: string;
  hiringCid: number | null;
}

const STORAGE_KEY = "pesce_portal_v1";

const load = (): PortalState => {
  if (typeof window === "undefined") return { hiringQuery: "", innovxQuery: "", hiringCid: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { hiringQuery: "", innovxQuery: "", hiringCid: null };
  } catch {
    return { hiringQuery: "", innovxQuery: "", hiringCid: null };
  }
};

let state: PortalState = load();

const save = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};

export const portalStore = {
  get: () => ({ ...state }),
  setHiring: (q: string, cid: number | null) => {
    state.hiringQuery = q;
    state.hiringCid = cid;
    save();
  },
  setInnovx: (q: string) => {
    state.innovxQuery = q;
    save();
  }
};
