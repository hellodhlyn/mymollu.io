import { LoaderFunction, V2_MetaFunction, json } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData, useRouteError } from "@remix-run/react";
import { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules";
import { useState } from "react";
import { authenticator } from "~/auth/authenticator.server";
import { PartyGenerator } from "~/components/PartyGenerator";
import { Button } from "~/components/atoms/form";
import { Student } from "~/models/student";
import { StudentState, getUserStudentStates } from "~/models/studentState";
import { Env } from "~/env.server";
import { useStateFilter } from "~/components/organisms/student";

type LoaderData = {
  username: string;
  currentUsername: string | null;
  states: StudentState[];
}

export const loader: LoaderFunction = async ({ context, request, params }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");
  const sensei = await authenticator.isAuthenticated(request);
  return json<LoaderData>({
    username,
    currentUsername: sensei?.username || null,
    states: await getUserStudentStates(context.env as Env, username),
  });
};

export const meta: V2_MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""}의 학생부 | MyMollu`.trim() },
    { name: "description", content: `모집한 학생 목록을 확인해보세요` },
    { name: "og:title", content: `${params.username || ""}의 학생부 | MyMollu`.trim() },
    { name: "og:description", content: `모집한 학생 목록을 확인해보세요` },
  ];
};

export const ErrorBoundary: V2_ErrorBoundaryComponent = () => {
  const error = useRouteError() as any;
  console.error(error);
  return <p>{error.toString()}</p>
};

type Filter = {
  minimumTier: number;
  attackTypes: Student["attackType"][];
};

export default function UserPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { username, currentUsername, states } = loaderData;
  if (!states || states.length === 0) {
    return (
      <p>선생님을 찾을 수 없어요. 다른 이름으로 검색해보세요.</p>
    );
  }

  const [StateFilter, filteredStates] = useStateFilter(states);
  const [partyStudents, setPartyStudents] = useState<(Student | null)[]>(new Array(6).fill(null));

  const addPartyStudent = (student: Student) => () => {
    if (partyStudents.filter((each) => each !== null).length >= 6 ||
        partyStudents.includes(student)) {
      return;
    }

    if (student.role === "striker") {
      const currentStrikers = partyStudents.filter((each) => each?.role === "striker");
      if (currentStrikers.length >= 4) {
        return;
      }

      setPartyStudents((prev) => {
        const newPartyStudents = [...prev];
        newPartyStudents[newPartyStudents.indexOf(null)] = student;
        return newPartyStudents;
      });
    } else {
      const currentSpecials = partyStudents.filter((each) => each?.role === "special");
      if (currentSpecials.length >= 2) {
        return;
      }

      setPartyStudents((prev) => {
        const newPartyStudents = [...prev];
        newPartyStudents[prev[4] == null ? 4 : 5] = student;
        return newPartyStudents;
      });
    }
  };

  return (
    <>
      <div className="my-12">
        <h1 className="my-2 font-black text-4xl">
          {username === currentUsername ? "나" : `@${username}`}의 학생부
        </h1>

        <div className="my-4">
          {(username === currentUsername) && (
            <Link to="/edit">
              <Button text="학생부 편집" color="primary" />
            </Link>
          )}
          <Link to="./parties">
            <Button text="편성한 파티" />
          </Link>
        </div>
      </div>

      {StateFilter}

      <div className="my-8">
        <p className="font-bold text-xl my-2">보유 학생</p>
        <div className="grid grid-cols-6 md:grid-cols-8 gap-1 sm:gap-2">
          {filteredStates.filter(({ owned }) => owned).map(({ student }) => (
            <div
              key={`list-students-${student.id}`}
              className="hover:scale-105 cursor-pointer transition"
              onClick={addPartyStudent(student)}
            >
              <img className="rounded-lg" src={student.imageUrl} alt={student.name} />
              <p className="text-center text-sm">{student.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="my-8">
        <p className="font-bold text-xl my-2">미보유 학생</p>
        <div className="grid grid-cols-6 md:grid-cols-8 gap-1 sm:gap-2">
          {filteredStates.filter(({ owned }) => !owned).map(({ student }) => (
            <div key={`list-students-${student.id}`}>
              <img className="rounded-lg grayscale" src={student.imageUrl} alt={student.name} />
              <p className="text-center text-sm">{student.name}</p>
            </div>
          ))}
        </div>
      </div>

      {(username === currentUsername) && (
        <div className="fixed w-screen bottom-0 left-0">
          <Form action="/api/parties" method="post">
            <PartyGenerator students={partyStudents} onReset={() => setPartyStudents(new Array(6).fill(null))} />
            <input type="hidden" name="username" value={username} />
            <input type="hidden" name="studentIds" value={JSON.stringify(partyStudents.filter((each) => each !== null).map((each) => each?.id))} />
          </Form>
        </div>
      )}
    </>
  );
};
