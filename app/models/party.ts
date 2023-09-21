import { Env } from "~/env.server";
import { Sensei, getSenseiByUsername } from "./sensei";

export type Party = {
  uid?: string;
  name: string;
  studentIds: string[];
};

function partyKey(username: string) {
  return `parties:${username}`;
}

export function partyKeyById(id: number) {
  return `parties:id:${id}`;
}

export async function getUserParties(env: Env, username: string): Promise<Party[]> {
  const sensei = await getSenseiByUsername(env, username);
  const rawParties = await env.KV_USERDATA.get(sensei ? partyKeyById(sensei.id) : partyKey(username));
  if (!rawParties) {
    return [];
  }

  return JSON.parse(rawParties) as Party[];
}

export async function removePartyByName(env: Env, sensei: Sensei, name: string) {
  const existingParties = await getUserParties(env, sensei.username);
  const newParties = existingParties.filter((party) => party.name !== name);
  await env.KV_USERDATA.put(partyKeyById(sensei.id), JSON.stringify(newParties));
}

export async function addParty(env: Env, sensei: Sensei, newParty: Party) {
  if (!newParty.uid) {
    newParty.uid = Math.random().toString(36).slice(2);
  }

  const existingParties = await getUserParties(env, sensei.username);
  const newParties = [...existingParties, newParty];
  await env.KV_USERDATA.put(partyKeyById(sensei.id), JSON.stringify(newParties));
}

export async function migrateParties(env: Env, username: string, id: number) {
  const rawStates = await env.KV_USERDATA.get(partyKey(username));
  if (rawStates && !(await env.KV_USERDATA.get(partyKeyById(id)))) {
    const states = JSON.parse(rawStates) as Party[];
    const newStates = states.map((state) => ({ ...state, uid: Math.random().toString(36).slice(2) }));
    await env.KV_USERDATA.put(partyKeyById(id), JSON.stringify(newStates));
    // TODO: active when code become stable
    // await env.KV_USERDATA.delete(partyKey(username));
  }
}
