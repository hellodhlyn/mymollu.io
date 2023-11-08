import type { LoaderFunction } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/auth/authenticator.server";
import type { Env } from "~/env.server";

export const loader: LoaderFunction = ({ request, context }) => {
  return getAuthenticator(context.env as Env).authenticate("google", request, {
    successRedirect: "/register",
    failureRedirect: "/signin?state=failed",
  });
};
