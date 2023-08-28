import { V2_MetaFunction } from "@remix-run/cloudflare";
import { Form, Link, useRouteError } from "@remix-run/react";
import { useEffect, useState } from "react";
import { StudentState } from "~/models/studentState";
import { fetchAllStudents } from "~/fetches/api";
import FilterButton from "~/components/FilterButton";
import { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules";

export const meta: V2_MetaFunction = () => [
  { title: "학생부 편집 | MyMollu" },
];

type Filter = {
  minimumTier: number;
};

export const ErrorBoundary: V2_ErrorBoundaryComponent = () => {
  const error = useRouteError() as any;
  console.error(error);
  return <p>{error.toString()}</p>
};

export default function EditPage() {
  const [username, setUsername] = useState<string>("");
  const [students, setStudents] = useState<StudentState[]>([]);
  const [filter, setFilter] = useState<Filter>({ minimumTier: 1 });

  useEffect(() => {
    if (students && students.length > 0) {
      return;
    }

    fetchAllStudents().then((allStudents) => {
      setStudents(allStudents.map((student) => ({ student, owned: student.tier < 3 })));
    });
  }, [students, setStudents]);

  const loadState = async () => {
    const response = await fetch(`/api/student-states?username=${username}`);
    if (!response.ok) {
      return;
    }

    const { states } = await response.json() as { states: StudentState[] };
    setStudents(students.map((student) => ({
      ...student,
      owned: states.some((state) => state.student.id === student.student.id),
    })));
  };

  return (
    <>
      <div className="my-12">
        <Link to="/">
          <p className="cursor-pointer text-gray-500 hover:underline">← 처음으로</p>
        </Link>
        <h1 className="my-2 font-black text-4xl">학생부 편집</h1>
      </div>

      <Form method="post" action="/api/student-states">
        <div className="my-8">
          <p className="font-bold text-xl my-1">저장/불러오기 (임시)</p>
          <p className="text-gray-500 my-1 text-sm">추후 로그인 기능으로 대체</p>
          <div className="flex my-4">
            <input
              type="text" name="username" placeholder="사용자 이름" className="p-2 border w-1/2"
              value={username} onChange={(e) => setUsername(e.target.value)}
            />
            <input type="hidden" name="states" value={JSON.stringify(students.filter(({ owned }) => owned))} />
            <button type="button" className="inline-block ml-2 px-4 py-2 border rounded-lg shadow-lg" onClick={loadState}>불러오기</button>
            <button type="submit" className="inline-block ml-2 px-4 py-2 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-300">저장</button>
          </div>
        </div>

        <div className="my-8 items-center">
          <p className="font-bold text-xl my-2">필터</p>
          <FilterButton
            label="3성 이하 감추기" active={filter.minimumTier === 3}
            onActivate={(activated) => setFilter({ minimumTier: activated ? 3 : 1 })}
          />
        </div>

        <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
          {students.filter(({ student }) => student.tier >= filter.minimumTier).map(({ student, owned }) => (
            <div
              key={`edit-students-${student.id}`}
              className={`hover:scale-105 cursor-pointer transition ${owned ? "grayscale-100" : "opacity-75 grayscale"}`}
              onClick={() => { setStudents(students.map((s) => s.student.id === student.id ? { ...s, owned: !s.owned } : s)); }}
            >
              <img className="rounded-lg" src={student.imageUrl} alt={student.name} />
              <p className="text-center text-sm">{student.name}</p>
            </div>
          ))}
        </div>
      </Form>
    </>
  );
};
