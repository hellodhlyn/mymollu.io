import { LoaderFunction, V2_MetaFunction, json } from "@remix-run/cloudflare";
import { Link, useLoaderData, useRouteError } from "@remix-run/react";
import { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules";
import { Star, Archery } from "iconoir-react";
import { useEffect, useState } from "react";
import FilterButton from "~/components/FilterButton";
import { fetchAllStudents, fetchStudentStates } from "~/fetches/api";
import { Student } from "~/models/student";
import { StudentState } from "~/models/studentState";

type LoaderData = {
  username: string;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");
  return json<LoaderData>({ username });
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
  const { username } = useLoaderData<LoaderData>();

  const [allStudents, setAllStudents]  = useState<Student[]>([]);
  const [states, setStates] = useState<StudentState[]>([]);
  const [filter, setFilter] = useState<Filter>({ minimumTier: 1, attackTypes: [] });

  const onActivateAttackType = (activated: boolean, attackType: Student["attackType"]) => {
    setFilter((prev) => ({
      ...prev,
      attackTypes: activated ? [...prev.attackTypes, attackType] : prev.attackTypes.filter((type) => type !== attackType),
    }));
  };

  useEffect(() => {
    if (allStudents && allStudents.length > 0) {
      return;
    }

    fetchAllStudents().then((students) => {
      setAllStudents(students);
      fetchStudentStates(username).then((states) => setStates(states));
    });
  }, [allStudents, setAllStudents]);

  return (
    <>
      <div className="my-12">
        <Link to="/">
          <p className="cursor-pointer text-gray-500 hover:underline">← 처음으로</p>
        </Link>
        <h1 className="my-2 font-black text-4xl">@{username}의 학생부</h1>
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
          {applyFilter(states, filter).map(({ student }) => (
            <div key={`list-students-${student.id}`}>
              <img className="rounded-lg" src={student.imageUrl} alt={student.name} />
              <p className="text-center text-sm">{student.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="my-8">
        <p className="font-bold text-xl my-2">미보유 학생</p>
        <div className="grid grid-cols-6 md:grid-cols-8 gap-1 sm:gap-2">
          {allStudents.filter((student) => !states.find((state) => state.student.id === student.id)).map((student) => (
            <div key={`list-students-${student.id}`}>
              <img className="rounded-lg grayscale" src={student.imageUrl} alt={student.name} />
              <p className="text-center text-sm">{student.name}</p>
            </div>
          ))}
        </div>
      </div>

    </>
  );
};
