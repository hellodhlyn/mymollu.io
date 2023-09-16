import { ActionFunction, redirect } from "@remix-run/cloudflare"
import { Env } from "~/env.server";
import { getUserParties, partyKey } from "~/models/party";

export const action: ActionFunction = async ({ context, request })  => {
  const env = context.env as Env;

  const formData = await request.formData();
  const username = formData.get("username") as string;
  const existingParties = await getUserParties(env, username);

  const name = formData.get("name") as string;
  const studentIds = formData.get("studentIds") as string;
  const newParties = [...existingParties, { name, studentIds: JSON.parse(studentIds) }];

  await env.KV_USERDATA.put(partyKey(username), JSON.stringify(newParties));
  return redirect(`/@${username}/parties`);
};
