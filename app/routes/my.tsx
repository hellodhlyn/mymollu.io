import { LoaderFunction, redirect } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth/build/authenticator";
import { Sensei } from "~/models/sensei";

export const loader: LoaderFunction = async ({ request, context }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  if (sensei) {
    return redirect(`/@${sensei.username}`);
  } else {
    return redirect("/signin");
  }
}
