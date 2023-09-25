import { ActionFunction, LoaderFunction, V2_MetaFunction, json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { Authenticator } from "remix-auth";
import { SmallButton } from "~/components/atoms/form";
import { SubTitle } from "~/components/atoms/typography";
import { StudentCards } from "~/components/molecules/student";
import { Env } from "~/env.server";
import { Party, getUserParties, removePartyByName } from "~/models/party";
import { Sensei } from "~/models/sensei";
import { StudentState, getUserStudentStates } from "~/models/studentState";

export const meta: V2_MetaFunction = () => [
  { title: "기존 편성 관리 | MolluLog" },
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
  await removePartyByName(env, sensei, formData.get("name") as string)
  return redirect(`/edit/parties`);
};


export default function EditParties() {
  const { states, parties } = useLoaderData<LoaderData>();
  return (
    <>
      {parties.map((party) => (
        <div key={`party-${party.name}`} className="my-8">
          <SubTitle text={party.name} />
          <div className="my-4">
            <Form method="post">
              <input type="hidden" name="name" value={party.name} />
              <SmallButton type="submit" color="red" text="편성 삭제" />
            </Form>
          </div>
          <StudentCards
            cardProps={party.studentIds.map((id) => {
              const state = states.find((state) => state.student.id === id)!;
              return {
                id: state.student.id,
                name: state.student.name,
                imageUrl: state.student.imageUrl,
              }
            })}
          />
        </div>
      ))}
    </>
  );
}
