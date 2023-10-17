import { ActionFunction, LoaderFunction, V2_MetaFunction, json, redirect } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { AddCircle } from "iconoir-react";
import { Authenticator } from "remix-auth";
import { SubTitle } from "~/components/atoms/typography";
import { StudentCards } from "~/components/molecules/student";
import { Env } from "~/env.server";
import { Party, getUserParties, removePartyByUid } from "~/models/party";
import { Sensei } from "~/models/sensei";
import { StudentState, getUserStudentStates } from "~/models/studentState";

export const meta: V2_MetaFunction = () => [
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
          className="my-8 p-4 flex justify-center items-center border border-neutral-200
                     rounded-lg text-neutral-500 hover:bg-neutral-100 transition cursor-pointer"
        >
          <AddCircle className="h-4 w-4 mr-2" strokeWidth={2} />
          <span>새로운 편성 추가하기</span>
        </div>
      </Link>

      {parties.map((party) => (
        <div key={`party-${party.uid}`} className="my-4 border border-neutral-200 rounded-lg shadow-lg">
          <div className="px-4 py-2 md:px-6 md:py-4 border-b border-neutral-200">
            <SubTitle text={party.name} />
            <div className="my-2">
              <StudentCards
                cardProps={party.studentIds.map((id) => {
                  const state = states.find((state) => state.student.id === id)!;
                  return {
                    id: state.student.id,
                    name: state.student.name,
                    imageUrl: state.student.imageUrl,
                  };
                })}
              />
            </div>
          </div>

          <div className="px-2 flex justify-end text-red-500 font-bold">
            <Form method="post">
              <input type="hidden" name="uid" value={party.uid} />
              <button className="p-4 hover:bg-neutral-100 transition">삭제</button>
            </Form>
          </div>
        </div>
      ))}
    </div>
  );
}
