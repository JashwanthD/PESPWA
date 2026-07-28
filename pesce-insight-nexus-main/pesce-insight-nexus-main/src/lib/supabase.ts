import { createClient } from '@supabase/supabase-js';

// 1. Declare URLs and Keys with absolute fallbacks (Hoisted)
const supabaseUrl = import.meta.env.VITE_SUPABASE_INTELLIGENCE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_INTELLIGENCE_ANON_KEY || '';

// 2. The "Safe-Client" Constructor
const createSafeClient = (url: string, key: string, label: string) => {
  // 1. Validation Guard
  const isInvalid = !url || !key || !url.startsWith('http') || url.includes('placeholder');

  // 2. Resilient Proxy Generator (The Mock Client)
  const createResilientProxy = (name: string) => {
    const proxy: any = new Proxy(() => proxy, {
      get: (_, prop) => {
        if (prop === 'then') return undefined; // Not a promise until called
        if (prop === 'auth') return { 
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: () => Promise.resolve({ data: { session: null }, error: null }),
          signOut: () => Promise.resolve({ error: null })
        };
        // Handle database and realtime chain methods (.from, .channel, etc)
        if (['from', 'select', 'insert', 'update', 'delete', 'eq', 'single', 'order', 'limit', 'channel', 'removeChannel', 'on', 'subscribe', 'unsubscribe'].includes(String(prop))) {
          return () => proxy;
        }
        return createResilientProxy(`${name}.${String(prop)}`);
      },
      apply: () => {
        // Return a promise for async-looking calls like .select() or .single()
        return Promise.resolve({ data: [], error: null });
      }
    });
    return proxy;
  };

  if (isInvalid) {
    console.warn(`[Supabase] ⚠️ ${label} in Safe-Boot Mode (using Mock Client). URL: ${url || 'MISSING'}`);
    return createResilientProxy(label);
  }

  try {
    return createClient(url, key);
  } catch (error) {
    console.error(`[Supabase] ❌ Critical Error initializing ${label}:`, error);
    return createResilientProxy(label);
  }
};

// 3. Export established client
console.log(`[Supabase] 🛰️ Initializing Nexus Node: ${supabaseUrl || 'EMPTY'}`);
export const supabase = createSafeClient(supabaseUrl, supabaseAnonKey, 'Nexus Node');

// 4. Aliases for Application Compatibility
export const supabaseMS1 = supabase;
export const supabaseMS2 = supabase;
export const supabaseIntelligence = supabase;
export const supabaseHiring = supabase;

// 5. Shared Logic & Types
export type UserRole = "admin" | "student" | null;

export const applyToCompany = async (userId: string, companyId: number) => {
  console.log(`[Trigger] Execution: UI_ID [${companyId}] -> Production Sync`);

  const { data, error } = await supabase
    .from("applications")
    .insert([{
      user_id: userId,
      company_id: companyId,
      status: "pending",
      applied_at: new Date().toISOString()
    }])
    .select();

  if (error) throw error;
  return data;
};