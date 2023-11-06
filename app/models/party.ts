import { nanoid } from "nanoid/non-secure";
import { Env } from "~/env.server";
import { Sensei, getSenseiByUsername } from "./sensei";

type PartyFields = {
  name: string;
  studentIds: string[] | string[][];
  raidId?: string | null;
}

export type Party = {
  uid: string;
} & PartyFields;

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

  return (JSON.parse(rawParties) as Party[]);
}

export async function removePartyByUid(env: Env, sensei: Sensei, uid: string) {
  const existingParties = await getUserParties(env, sensei.username);
  const newParties = existingParties.filter((party) => party.uid !== uid);
  await env.KV_USERDATA.put(partyKeyById(sensei.id), JSON.stringify(newParties));
}

export async function updateOrCreateParty(env: Env, sensei: Sensei, fields: PartyFields, uid?: string) {
  if (fields.studentIds.length === 0) {
    // TODO - handle error
    return;
  }

  const existingParties = await getUserParties(env, sensei.username);

  let updatedParties: Party[] = [];
  if (uid) {
    const existingParty = existingParties.find((party) => party.uid === uid);
    if (!existingParty) {
      return;
    }
    const updatedParty = { ...existingParty, ...fields };
    updatedParties = existingParties.map((party) => party.uid === uid ? updatedParty : party);
  } else {
    const newParty: Party = { uid: nanoid(8), ...fields };
    updatedParties = [...existingParties, newParty];
  }

  updatedParties = updatedParties.filter((party) => party !== null);
  await env.KV_USERDATA.put(partyKeyById(sensei.id), JSON.stringify(updatedParties));
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
 