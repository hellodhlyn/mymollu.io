import { LoaderFunction, V2_MetaFunction, json } from "@remix-run/cloudflare";
import { Link, useLoaderData, useRouteError } from "@remix-run/react";
import { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules";
import { useEffect, useState } from "react";
import FilterButton from "~/components/FilterButton";
import { fetchStudentStates } from "~/fetches/api";
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
};

function applyFilter(states: StudentState[], filter: Filter): StudentState[] {
  return states.filter(({ student }) => {
    if (student.tier < filter.minimumTier) {
      return false;
    }
    return true;
  });
}

export default function UserPage() {
  const { username } = useLoaderData<LoaderData>();

  const [states, setStates] = useState<StudentState[]>([]);
  const [filter, setFilter] = useState<Filter>({ minimumTier: 1 });

  useEffect(() => {
    if (states && states.length > 0) {
      return;
    }

    fetchStudentStates(username).then((states) => {
      setStates(states);
    });
  }, [states, setStates]);

  return (
    <>
      <div className="my-12">
        <Link to="/">
          <p className="cursor-pointer text-gray-500 hover:underline">← 처음으로</p>
        </Link>
        <h1 className="my-2 font-black text-4xl">@{username}의 학생부</h1>
      </div>

      <div className="my-8 items-center">
        <p className="font-bold text-xl my-2">필터</p>
        <FilterButton
          label="3성 이하 감추기" active={filter.minimumTier === 3}
          onActivate={(activated) => setFilter((prev) => ({ ...prev, minimumTier: activated ? 3 : 1 }))}
        />
      </div>

      <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
        {applyFilter(states, filter).map(({ student }) => (
          <div key={`list-students-${student.id}`}>
            <img className="rounded-lg" src={student.imageUrl} alt={student.name} />
            <p className="text-center text-sm">{student.name}</p>
          </div>
        ))}
      </div>

    </>
  );
};
