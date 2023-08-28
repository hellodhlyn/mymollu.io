import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/cloudflare"
import { Env } from "~/env";
import { Party } from "~/models/party";

function partyKey(username: string) {
  return `parties:${username}`;
}

async function getParties(env: Env, username: string): Promise<Party[]> {
  const key = partyKey(username);
  const parties = await env.KV_USERDATA.get(key);
  if (!parties) {
    return [];
  }

  return JSON.parse(parties) as Party[];
}

export const loader: LoaderFunction = async ({ context, request }) => {
  const env = context.env as Env;

  const url = new URL(request.url);
  const username = url.searchParams.get("username");
  if (!username) {
    return redirect(`/`);
  }

  const parties = await getParties(env, username);
  return json({ parties });
};

export const action: ActionFunction = async ({ context, request })  => {
  const env = context.env as Env;

  const formData = await request.formData();
  const username = formData.get("username") as string;
  const existingParties = await getParties(env, username);

  const name = formData.get("name") as string;
  const studentIds = formData.get("studentIds") as string;
  const newParties = [...existingParties, { name, studentIds: JSON.parse(studentIds) }];

  await env.KV_USERDATA.put(partyKey(username), JSON.stringify(newParties));
  return redirect(`/@${username}/parties`);
};
