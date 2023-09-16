import { LoaderFunction, V2_MetaFunction, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Env } from "~/env.server";
import { Party, getUserParties } from "~/models/party";
import { Student, getAllStudents } from "~/models/student";

export const meta: V2_MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""}의 학생 편성 | MolluLog`.trim() },
    { name: "description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
    { name: "og:title", content: `${params.username || ""}의 학생부 | MolluLog`.trim() },
    { name: "og:description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
  ];
};

type LoaderData = {
  username: string;
  allStudents: Student[];
  parties: Party[];
}

export const loader: LoaderFunction = async ({ context, params }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");
  return json<LoaderData>({
    username,
    allStudents: getAllStudents(),
    parties: await getUserParties(context.env as Env, username),
  });
};

export default function UserPartyPage() {
  const { allStudents, parties } = useLoaderData<LoaderData>();

  return (
    <>
      {parties.map((party) => (
        <div key={`party-${party.studentIds.join("_")}`} className="my-8">
          <p className="my-2 font-bold text-2xl">{party.name}</p>
          <div className="grid grid-cols-6 md:grid-cols-8 gap-1 md:gap-2">
            {party.studentIds.map((studentId) => {
              const student = allStudents.find((student) => student.id === studentId);
              if (!student) {
                return null;
              }

              return (
                <div key={`party-students-${student.id}`}>
                  <img className="rounded-lg" src={student.imageUrl} alt={student.name} />
                  <p className="text-center text-sm">{student.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
