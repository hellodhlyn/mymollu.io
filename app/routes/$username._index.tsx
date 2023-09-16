import { LoaderFunction, V2_MetaFunction, json } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData, useRouteError } from "@remix-run/react";
import { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules";
import { Star, Archery } from "iconoir-react";
import { useState } from "react";
import { authenticator } from "~/auth/authenticator.server";
import FilterButton from "~/components/FilterButton";
import { PartyGenerator } from "~/components/PartyGenerator";
import { Button } from "~/components/atoms/form";
import { Student } from "~/models/student";
import { StudentState, getUserStudentStates } from "~/models/studentState";
import { Env } from "~/env.server";

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

function applyFilter(states: StudentState[], filter: Filter): StudentState[] {
  return states.filter(({ student }) => {
    if (student.tier < filter.minimumTier) {
      return false;
    }
    if (filter.attackTypes.length > 0 && !filter.attackTypes.includes(student.attackType)) {
      return false;
    }
    return true;
  });
}

export default function UserPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { username, currentUsername, states } = loaderData;
  if (!states) {
    return (
      <p>선생님을 찾을 수 없어요. 다른 이름으로 검색해보세요.</p>
    );
  }

  const ownedStates = states.filter((state) => state.owned);
  const notOwnedStates = states.filter((state) => !state.owned);

  const [partyStudents, setPartyStudents] = useState<(Student | null)[]>(new Array(6).fill(null));
  const [filter, setFilter] = useState<Filter>({ minimumTier: 1, attackTypes: [] });

  const onActivateAttackType = (activated: boolean, attackType: Student["attackType"]) => {
    setFilter((prev) => ({
      ...prev,
      attackTypes: activated ? [...prev.attackTypes, attackType] : prev.attackTypes.filter((type) => type !== attackType),
    }));
  };

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

      <div className="my-8">
        <p className="my-2 font-bold text-xl">필터</p>
        <div className="my-2 flex items-center">
          <Star className="h-5 w-5 mr-2" strokeWidth={2} />
          <FilterButton
            label="3성 이하 감추기" active={filter.minimumTier === 3}
            onActivate={(activated) => setFilter((prev) => ({ ...prev, minimumTier: activated ? 3 : 1 }))}
          />
        </div>
        <div className="my-2 flex items-center">
          <Archery className="h-5 w-5 mr-2" strokeWidth={2} />
          <FilterButton
            label="폭발" color="bg-red-500" active={filter.attackTypes.includes("explosive")}
            onActivate={(activated) => onActivateAttackType(activated, "explosive")}
          />
          <FilterButton
            label="관통" color="bg-yellow-500" active={filter.attackTypes.includes("piercing")}
            onActivate={(activated) => onActivateAttackType(activated, "piercing")}
          />
          <FilterButton
            label="신비" color="bg-blue-500" active={filter.attackTypes.includes("mystic")}
            onActivate={(activated) => onActivateAttackType(activated, "mystic")}
          />
        </div>
      </div>

      <div className="my-8">
        <p className="font-bold text-xl my-2">보유 학생</p>
        <div className="grid grid-cols-6 md:grid-cols-8 gap-1 sm:gap-2">
          {applyFilter(ownedStates, filter).map(({ student }) => (
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
          {applyFilter(notOwnedStates, filter).map(({ student }) => (
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
