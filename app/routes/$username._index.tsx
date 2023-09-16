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
import { StudentCards } from "~/components/molecules/student";

type LoaderData = {
  username: string;
  currentUsername: string | null;
  states: StudentState[] | null;
}

export const loader: LoaderFunction = async ({ context, request, params }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");
  const sensei = await authenticator.isAuthenticated(request);
  let states = await getUserStudentStates(context.env as Env, username, true);

  return json<LoaderData>({
    username,
    currentUsername: sensei?.username || null,
    states,
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

export default function UserPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { username, currentUsername, states } = loaderData;
  if (!states) {
    return (
      <p>선생님을 찾을 수 없어요. 다른 이름으로 검색해보세요.</p>
    );
  }

  const [StateFilter, filteredStates] = useStateFilter(states);
  const [partyStudents, setPartyStudents] = useState<(Student | null)[]>(new Array(6).fill(null));

  const addPartyStudent = (id: string) => {
    const student = states.find((state) => state.student.id === id)?.student;
    if (!student) {
      return;
    }

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
            <>
              <Link to="/edit/students">
                <Button text="보유 학생 관리" color="primary" />
              </Link>
              <Link to="/edit/specs">
                <Button text="학생 성장 관리" color="primary" />
              </Link>
            </>
          )}
          <Link to="./parties">
            <Button text="편성한 파티" />
          </Link>
        </div>
      </div>

      {StateFilter}

      <div className="my-8">
        <p className="font-bold text-xl my-2">보유 학생</p>
        <StudentCards
          cardProps={filteredStates.filter(({ owned }) => owned).map(({ student, tier }) => ({
            id: student.id,
            name: student.name,
            imageUrl: student.imageUrl,
            tier: tier ?? student.initialTier,
          }))}
          onSelect={(id) => { addPartyStudent(id); }}
        />
      </div>

      <div className="my-8">
        <p className="font-bold text-xl my-2">미보유 학생</p>
        <StudentCards
          cardProps={filteredStates.filter(({ owned }) => !owned).map(({ student }) => ({
            id: student.id,
            name: student.name,
            imageUrl: student.imageUrl,
            grayscale: true,
          }))}
        />
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
