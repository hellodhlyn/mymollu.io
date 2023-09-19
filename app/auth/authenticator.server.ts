import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { Env } from "~/env.server";
import { Sensei } from "~/models/sensei";

let _authenticator: Authenticator<Sensei>;

export function newAuthenticator(env: Env): Authenticator<Sensei> {
  if (_authenticator) {
    return _authenticator;
  }

  const sessionStorage = createCookieSessionStorage({
    cookie: {
      name: "__session",
      path: "/",
      httpOnly: true,
      secure: true,
      secrets: [env.SESSION_SECRET],
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    },
  });

  const authenticator = new Authenticator<Sensei>(sessionStorage);
  authenticator.use(new FormStrategy(async ({ form }) => {
    // TODO: implement

    const username = form.get("username");
    if (!username) {
      throw "No username";
    }
    return { username: username as string };
  }), "form");

  _authenticator = authenticator;
  return authenticator;
}
