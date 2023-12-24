import { Env } from "~/env.server";

export async function fetchStaticData<T>(env: Env, name: string): Promise<T | null> {
  const body = await env.KV_STATIC_DATA.get(name);
  if (!body) {
    return null;
  }
  return JSON.parse(body) as T;
}

export async function storeStaticData<T>(env: Env, name: string, data: T) {
  await env.KV_STATIC_DATA.put(name, JSON.stringify(data));
}
