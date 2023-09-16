import { Env } from "~/env.server";

export type Party = {
  name: string;
  studentIds: string[];
};

export function partyKey(username: string) {
  return `parties:${username}`;
}

export async function getUserParties(env: Env, username: string): Promise<Party[]> {
  const rawParties = await env.KV_USERDATA.get(partyKey(username));
  if (!rawParties) {
    return [];
  }

  return JSON.parse(rawParties) as Party[];
}
