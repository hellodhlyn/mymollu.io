import { LoaderFunction, redirect } from "@remix-run/cloudflare";
import { authenticator } from "~/auth/authenticator.server";

export const loader: LoaderFunction = async ({ request }) => {
  const sensei = await authenticator.isAuthenticated(request);
  if (sensei) {
    return redirect(`/@${sensei.username}`);
  } else {
    return redirect("/signin");
  }
}
