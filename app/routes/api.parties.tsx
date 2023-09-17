import { ActionFunction, redirect } from "@remix-run/cloudflare"
import { authenticator } from "~/auth/authenticator.server";
import { Env } from "~/env.server";
import { getUserParties, partyKey } from "~/models/party";

export const action: ActionFunction = async ({ context, request })  => {
  const env = context.env as Env;
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  const { username } = sensei;
  const existingParties = await getUserParties(env, username);

  if (request.method === "POST") {
    const name = formData.get("name") as string;
    const studentIds = formData.get("studentIds") as string;
    const newParties = [...existingParties, { name, studentIds: JSON.parse(studentIds) }];

    await env.KV_USERDATA.put(partyKey(username), JSON.stringify(newParties));
    return redirect(`/@${username}/parties`);
  } else if (request.method === "DELETE") {
    const name = formData.get("name") as string;
    const newParties = existingParties.filter((party) => party.name !== name);
    await env.KV_USERDATA.put(partyKey(username), JSON.stringify(newParties));
    return redirect(`/edit/parties`);
  }
};
