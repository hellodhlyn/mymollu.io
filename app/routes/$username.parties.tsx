import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { PartyView } from "~/components/organisms/party";
import type { Env } from "~/env.server";
import type { Party } from "~/models/party";
import { getUserParties } from "~/models/party";
import type { StudentState } from "~/models/studentState";
import { getUserStudentStates } from "~/models/studentState";

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""} - 편성 | MolluLog`.trim() },
    { name: "description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
    { name: "og:title", content: `${params.username || ""} - 편성 | MolluLog`.trim() },
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
    parties: (await getUserParties(env, username)).reverse(),
  });
};

export default function UserPartyPage() {
  const { states, parties } = useLoaderData<LoaderData>();

  return (
    <div className="my-8">
      {parties.map((party) => (
        <PartyView key={`party-${party.uid}`} party={party} studentStates={states} />
      ))}
    </div>
  );
}
