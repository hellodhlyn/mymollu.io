import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Env } from "~/env.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const me = await getAuthenticator(env).isAuthenticated(request);
  if (!me || (me.username !== env.SUPERUSER_NAME)) {
    return new Response("unauthorized", { status: 401 });
  }

  await env.KV_USERDATA.list({ prefix: "cache:" }).then((keys) => {
    keys.keys.forEach((key) => env.KV_USERDATA.delete(key.name));
  });

  return new Response("ok", { status: 200 });
}
