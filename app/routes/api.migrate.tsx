import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/auth/authenticator.server";
import type { Env } from "~/env.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const me = await getAuthenticator(env).isAuthenticated(request);
  if (!me || (me.username !== env.SUPERUSER_NAME)) {
    return new Response("unauthorized", { status: 401 });
  }

  return new Response("ok", { status: 200 });
};
