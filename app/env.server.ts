import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { Database } from "./schema";

export interface Env {
  __STATIC_CONTENT: KVNamespace<string>;
  KV_USERDATA: KVNamespace;
  KV_STATIC_DATA: KVNamespace;

  HOST: string;
  STAGE: "dev" | "prod";

  SESSION_SECRET: string;
  GOOGLE_CLIENT_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  SUPERUSER_NAME: string;
}

let _db: SupabaseClient<Database>;

export function getDB(env: Env) {
  if (_db) {
    return _db;
  }

  _db = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_KEY);
  return _db;
}
