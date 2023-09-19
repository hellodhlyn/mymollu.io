export interface Env {
  __STATIC_CONTENT: KVNamespace<string>;

  KV_USERDATA: KVNamespace;

  SESSION_SECRET: string;
};

export function setEnv(e: Env) {
  console.log(e);
  env = e;
}

export let env: Env;
