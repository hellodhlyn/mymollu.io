import { ActionFunction, LoaderFunction, MetaFunction, json, redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { AddCircle } from "iconoir-react";
import { Authenticator } from "remix-auth";
import { SubTitle } from "~/components/atoms/typography";
import { PartyView } from "~/components/organisms/party";
import { Env } from "~/env.server";
import { Party, getUserParties, removePartyByUid } from "~/models/party";
import { Sensei } from "~/models/sensei";
import { StudentState, getUserStudentStates } from "~/models/studentState";

export const meta: MetaFunction = () => [
  { title: "편성 관리 | MolluLog" },
];

type LoaderData = {
  states: StudentState[];
  parties: Party[];
}

export const loader: LoaderFunction = async ({ context, request }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const env = context.env as Env;
  return json<LoaderData>({
    states: (await getUserStudentStates(env, sensei.username, true))!,
    parties: await getUserParties(env, sensei.username),
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
  await removePartyByUid(env, sensei, formData.get("uid") as string);
  return redirect(`/edit/parties`);
};

export default function EditParties() {
  const { states, parties } = useLoaderData<LoaderData>();
  return (
    <div className="my-8">
      <SubTitle text="편성 관리" />

      <Link to="/edit/parties/new">
        <div
          className="my-4 p-4 flex justify-center items-center border border-neutral-200
                     rounded-lg text-neutral-500 hover:bg-neutral-100 transition cursor-pointer"
        >
          <AddCircle className="h-4 w-4 mr-2" strokeWidth={2} />
          <span>새로운 편성 추가하기</span>
        </div>
      </Link>

      {parties.map((party) => (
        <PartyView key={`party-${party.uid}`} party={party} studentStates={states} deletable />
      ))}
    </div>
  );
}
