import { createClient } from '@supabase/supabase-js';
import { API_URL } from './config/api.js';

let rawClient = null;
let initPromise = null;

// Read available initial keys from build-time Vite environment or localStorage
function getLocalCredentials() {
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.SUPABASE_URL ||
    (typeof window !== "undefined" ? localStorage.getItem("PEC_ACM_SUPABASE_URL") : "") ||
    "";

  const key =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_KEY ||
    import.meta.env.SUPABASE_KEY ||
    import.meta.env.SUPABASE_ANON_KEY ||
    (typeof window !== "undefined" ? localStorage.getItem("PEC_ACM_SUPABASE_KEY") : "") ||
    "";

  return { url: url.trim(), key: key.trim() };
}

export function initSupabase(url, key) {
  if (url && key) {
    try {
      rawClient = createClient(url, key);
      if (typeof window !== "undefined") {
        localStorage.setItem("PEC_ACM_SUPABASE_URL", url);
        localStorage.setItem("PEC_ACM_SUPABASE_KEY", key);
      }
      return rawClient;
    } catch (e) {
      console.warn("Failed to create Supabase client:", e);
    }
  }
  return null;
}

// Automatically fetch backend server config if frontend environment variables were not passed
export async function ensureSupabaseClient() {
  if (rawClient) return rawClient;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // 1. Try local/env credentials
    const { url, key } = getLocalCredentials();
    if (url && key) {
      const client = initSupabase(url, key);
      if (client) return client;
    }

    // 2. Fetch from backend /api/config/supabase
    try {
      const res = await fetch(`${API_URL}/api/config/supabase`);
      if (res.ok) {
        const data = await res.json();
        if (data.supabaseUrl && data.supabaseAnonKey) {
          const client = initSupabase(data.supabaseUrl, data.supabaseAnonKey);
          if (client) return client;
        }
      }
    } catch (err) {
      console.warn("Could not fetch Supabase configuration from server:", err);
    }

    return null;
  })();

  return initPromise;
}

// Eager initial attempt
const initial = getLocalCredentials();
if (initial.url && initial.key) {
  initSupabase(initial.url, initial.key);
} else if (typeof window !== "undefined") {
  ensureSupabaseClient();
}

/**
 * Transparent proxy for Supabase:
 * Ensures all existing code `supabase.from(...)`, `supabase.auth...` works seamlessly
 * without crashing even if credentials are initialized asynchronously.
 */
export const supabase = new Proxy({}, {
  get(_target, prop) {
    if (prop === "rawClient") return rawClient;
    if (prop === "initPromise") return initPromise;
    if (prop === "ensureClient") return ensureSupabaseClient;

    if (rawClient && prop in rawClient) {
      const val = rawClient[prop];
      return typeof val === "function" ? val.bind(rawClient) : val;
    }

    // Special handler for .from(table)
    if (prop === "from") {
      return (table) => {
        if (rawClient) {
          return rawClient.from(table);
        }

        // Return a chainable fallback builder that queries rawClient once ready
        const methodChain = {
          select: (...args) => executeQuery(table, "select", args),
          insert: (...args) => executeQuery(table, "insert", args),
          update: (...args) => executeQuery(table, "update", args),
          delete: (...args) => executeQuery(table, "delete", args),
          upsert: (...args) => executeQuery(table, "upsert", args)
        };

        async function executeQuery(tableName, operation, args) {
          const client = await ensureSupabaseClient();
          if (client) {
            let query = client.from(tableName)[operation](...args);
            return query;
          }
          return { data: null, error: new Error("Supabase is not connected or configured.") };
        }

        return new Proxy(methodChain, {
          get(chainTarget, chainProp) {
            if (chainProp in chainTarget) return chainTarget[chainProp];
            return (...chainArgs) => {
              return {
                order: () => executeQuery(table, "select", ["*"]),
                eq: () => executeQuery(table, "select", ["*"]),
                single: () => executeQuery(table, "select", ["*"]),
                then: (resolve, reject) => executeQuery(table, chainProp, chainArgs).then(resolve, reject)
              };
            };
          }
        });
      };
    }

    // Special handler for .auth
    if (prop === "auth") {
      return {
        getSession: async () => {
          const client = await ensureSupabaseClient();
          if (client?.auth) return client.auth.getSession();
          return { data: { session: null }, error: null };
        },
        getUser: async (token) => {
          const client = await ensureSupabaseClient();
          if (client?.auth) return client.auth.getUser(token);
          return { data: { user: null }, error: null };
        },
        onAuthStateChange: (callback) => {
          if (rawClient?.auth) return rawClient.auth.onAuthStateChange(callback);
          ensureSupabaseClient().then((client) => {
            if (client?.auth) client.auth.onAuthStateChange(callback);
          });
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        signInWithPassword: async (...args) => {
          const client = await ensureSupabaseClient();
          if (client?.auth) return client.auth.signInWithPassword(...args);
          return { data: null, error: new Error("Supabase auth not connected") };
        },
        signOut: async () => {
          const client = await ensureSupabaseClient();
          if (client?.auth) return client.auth.signOut();
          return { error: null };
        }
      };
    }

    if (rawClient) {
      return rawClient[prop];
    }

    return undefined;
  }
});

export default supabase;