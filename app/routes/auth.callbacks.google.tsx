import type { LoaderFunction } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/auth/authenticator.server";

export const loader: LoaderFunction = ({ request, context }) => {
  return getAuthenticator(context.cloudflare.env).authenticate("google", request, {
    successRedirect: "/register",
    failureRedirect: "/signin?state=failed",
  });
};
