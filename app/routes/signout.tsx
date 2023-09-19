import { LoaderFunction } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";

export const loader: LoaderFunction = async ({ request, context }) => {
  const authenticator = context.authenticator as Authenticator;
  await authenticator.logout(request, { redirectTo: "/" });
};
