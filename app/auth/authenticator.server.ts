import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { Sensei } from "~/models/sensei";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    path: "/",
    httpOnly: true,
    secure: true,
    secrets: [], // TODO
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

export {
  authenticator
};
