import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { PartyGenerator } from "~/components/organisms/party";
import type { Env } from "~/env.server";
import type { Party } from "~/models/party";
import { updateOrCreateParty, getUserParties } from "~/models/party";
import type { RaidEvent} from "~/models/raid";
import { getAllTotalAssaults } from "~/models/raid";
import type { StudentState } from "~/models/studentState";
import { getUserStudentStates } from "~/models/studentState";

export const meta: MetaFunction = () => [
  { title: "편성 관리 | MolluLog" },
];

type LoaderData = {
  currentUsername: string;
  states: StudentState[];
  raids: RaidEvent[];
  party: Party | null;
}

export const loader: LoaderFunction = async ({ context, request, params }) => {
  const env = context.env as Env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  let party = null;
  if (params.id) {
    party = (await getUserParties(env, sensei.username)).find((p) => p.uid === params.id) ?? null;
  }

  let states = await getUserStudentStates(env, sensei.username, true);
  return json<LoaderData>({
    currentUsername: sensei.username,
    states: states!,
    raids: getAllTotalAssaults(false),
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
  const uid = formData.get("uid");
  await updateOrCreateParty(env, sensei, {
    name: formData.get("name") as string,
    studentIds: JSON.parse(formData.get("studentIds") as string),
    raidId: raidId ? raidId as string : null,
  }, uid ? uid as string : undefined);
  return redirect(`/edit/parties`);
};

export default function EditNewParties() {
  const loaderData = useLoaderData<LoaderData>();

  return (
    <div className="my-8">
      <Form method="post">
        {loaderData.party && <input type="hidden" name="uid" value={loaderData.party?.uid} />}
        <PartyGenerator party={loaderData.party ?? undefined} raids={loaderData.raids} studentStates={loaderData.states} />
      </Form>
    </div>
  );
}
