import type { Env } from "~/env.server";

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

export function isUniqueConstraintError(err: Error): { table: string, column: string } | null {
  const match = err.message.match(/UNIQUE constraint failed: (\w+)\.(\w+)/);
  if (match) {
    return { table: match[1], column: match[2] };
  }

  return null;
}
