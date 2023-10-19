import { ActionFunction, LoaderFunction, V2_MetaFunction, json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { Authenticator } from "remix-auth";
import { PartyGenerator } from "~/components/organisms/party";
import { Env } from "~/env.server";
import { addParty } from "~/models/party";
import { RaidEvent, getAllTotalAssaults } from "~/models/raid";
import { Sensei } from "~/models/sensei";
import { StudentState, getUserStudentStates } from "~/models/studentState";

export const meta: V2_MetaFunction = () => [
  { title: "편성 관리 | MolluLog" },
];

type LoaderData = {
  currentUsername: string;
  states: StudentState[];
  raids: RaidEvent[];
}

export const loader: LoaderFunction = async ({ context, request }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  let states = await getUserStudentStates(context.env as Env, sensei.username, true);
  return json<LoaderData>({
    currentUsername: sensei.username,
    states: states!,
    raids: getAllTotalAssaults(),
  });
};

export const action: ActionFunction = async ({ context, request }) => {
  const env = context.env as Env;
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  const raidId = formData.get("raidId");
  await addParty(env, sensei, {
    name: formData.get("name") as string,
    studentIds: JSON.parse(formData.get("studentIds") as string),
    raidId: raidId ? raidId as string : null,
  });
  return redirect(`/edit/parties`);
};

export default function EditNewParties() {
  const loaderData = useLoaderData<LoaderData>();

  return (
    <div className="my-8">
      <Form method="post">
        <PartyGenerator raids={loaderData.raids} studentStates={loaderData.states} />
      </Form>
    </div>
  );
}
