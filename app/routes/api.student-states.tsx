import { ActionFunction, redirect } from "@remix-run/cloudflare";
import { Env } from "~/env.server";
import { userStateKey } from "~/models/studentState";

export const action: ActionFunction = async ({ context, request }) => {
  const env = context.env as Env;

  const formData = await request.formData();
  const username = formData.get("username") as string;
  const states = formData.get("states") as string;

  await env.KV_USERDATA.put(userStateKey(username), states);

  return redirect(`/@${username}`);
};
