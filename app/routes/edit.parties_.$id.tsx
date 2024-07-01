import type { ActionFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { PartyGenerator } from "~/components/organisms/party";
import type { Env } from "~/env.server";
import { graphql } from "~/graphql";
import type { RaidForPartyEditQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { updateParty, getUserParties, createParty } from "~/models/party";
import { getUserStudentStates } from "~/models/student-state";

const raidForPartyEditQuery = graphql(`
  query RaidForPartyEdit {
    raids {
      nodes { raidId name type boss terrain since until }
    }
  }
`);

export const meta: MetaFunction = () => [
  { title: "편성 관리 | MolluLog" },
];

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  let party = null;
  if (params.id) {
    party = (await getUserParties(env, sensei.username)).find((p) => p.uid === params.id) ?? null;
  }

  const { data } = await runQuery<RaidForPartyEditQuery>(raidForPartyEditQuery, {});
  if (!data) {
    throw "failed to load data";
  }

  let states = await getUserStudentStates(env, sensei.username);
  return json({
    states: states!,
    raids: data.raids.nodes,
    party,
  });
};

export const action: ActionFunction = async ({ context, request }) => {
  const env = context.env as Env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  const raidId = formData.get("raidId");
  const partyPatches = {
    name: formData.get("name") as string,
    studentIds: JSON.parse(formData.get("studentIds") as string),
    raidId: raidId ? raidId as string : null,
    showAsRaidTip: formData.get("showAsRaidTip") === "true",
    memo: formData.get("memo") as string | null,
  };

  const uid = formData.get("uid");
  if (!uid) {
    await createParty(env, sensei, partyPatches);
  } else {
    await updateParty(env, sensei, uid as string, partyPatches);
  }

  return redirect(`/@${sensei.username}/parties`);
};

export default function EditParties() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div className="my-8">
      <Form method="post">
        {loaderData.party && <input type="hidden" name="uid" value={loaderData.party.uid} />}
        <PartyGenerator 
          party={loaderData.party ?? undefined}
          raids={loaderData.raids.map((raid) => ({ ...raid, since: new Date(raid.since), until: new Date(raid.until)}))}
          studentStates={loaderData.states}
        />
      </Form>
    </div>
  );
}
