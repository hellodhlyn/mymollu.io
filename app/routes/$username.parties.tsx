import { LoaderFunction, V2_MetaFunction, json, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/auth/authenticator.server";
import { StudentCard } from "~/components/atoms/student";
import { SubTitle } from "~/components/atoms/typography";
import { Env } from "~/env.server";
import { Party, getUserParties } from "~/models/party";
import { StudentState, getUserStudentStates } from "~/models/studentState";

export const meta: V2_MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""}의  | MolluLog`.trim() },
    { name: "description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
    { name: "og:title", content: `${params.username || ""}의 학생부 | MolluLog`.trim() },
    { name: "og:description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
  ];
};

type LoaderData = {
  states: StudentState[];
  parties: Party[];
}

export const loader: LoaderFunction = async ({ context, params }) => {
  const env = context.env as Env;
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");
  const states = await getUserStudentStates(env, username, true);
  return json<LoaderData>({
    states: states!,
    parties: await getUserParties(env, username),
  });
};

export default function UserPartyPage() {
  const { states, parties } = useLoaderData<LoaderData>();

  return (
    <div className="my-8">
      {parties.map((party) => (
        <div key={`party-${party.studentIds.join("_")}`}>
          <SubTitle text={party.name} />
          <div className="grid grid-cols-6 md:grid-cols-8 gap-1 md:gap-2">
            {party.studentIds.map((studentId) => {
              const state = states.find(({ student }) => student.id === studentId);
              if (!state) {
                return null;
              }

              const { student } = state;
              return (
                <StudentCard
                  key={`party-students-${student.id}`}
                  id={student.id}
                  imageUrl={student.imageUrl}
                  name={student.name}
                  tier={state.owned ? (state.tier ?? student.initialTier) : null}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
