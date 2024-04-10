import { Env } from "~/env.server";

export async function fetchCached<T>(env: Env, cacheKey: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
  const cached = await env.KV_USERDATA.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  const data = await fn();
  const putOptions = ttl ? { expirationTtl: ttl } : undefined;
  await env.KV_USERDATA.put(cacheKey, JSON.stringify(data), putOptions);
  return data;
}

export async function deleteCache(env: Env, ...cacheKeys: string[]) {
  await Promise.all(cacheKeys.map((key) => env.KV_USERDATA.delete(key)));
}
