import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Env } from "~/env.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const me = await getAuthenticator(env).isAuthenticated(request);
  if (!me || (me.username !== env.SUPERUSER_NAME)) {
    return new Response("unauthorized", { status: 401 });
  }

  // Migrate parties from KV to DB
  const partyMigrateQuery = "insert into parties (uid, name, userId, raidId, students) values (?1, ?2, ?3, ?4, ?5)";
  const partyKeys = (await env.KV_USERDATA.list({ prefix: "parties:id" })).keys;

  await Promise.all(partyKeys.flatMap(async (key) => {
    console.log(`Migrating party ${key.name}`);
    const rawValue = await env.KV_USERDATA.get(key.name);
    if (!rawValue) {
      return;
    }

    const parties = JSON.parse(rawValue) as any[];
    return parties.map((party) => env.DB.prepare(partyMigrateQuery).bind(
      party.uid,
      party.name,
      parseInt(key.name.split(":")[2]),
      party.raidId ?? null,
      JSON.stringify(party.studentIds),
    ).run());
  }));

  return new Response("ok", { status: 200 });
};
