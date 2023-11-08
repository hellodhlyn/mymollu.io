import type { LoaderFunction } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/auth/authenticator.server";
import type { Env } from "~/env.server";

export const loader: LoaderFunction = async ({ request, context }) => {
  return getAuthenticator(context.env as Env).logout(request, { redirectTo: "/" });
};
