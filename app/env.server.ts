export interface Env {
  __STATIC_CONTENT: KVNamespace<string>;
  KV_USERDATA: KVNamespace;

  DB: D1Database;

  HOST: string;
  SESSION_SECRET: string;
  GOOGLE_CLIENT_SECRET: string;
};

export function setEnv(e: Env) {
  console.log(e);
  env = e;
}

export let env: Env;
