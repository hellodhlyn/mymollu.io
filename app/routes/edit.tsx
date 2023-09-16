import { LoaderFunction, V2_MetaFunction, json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData, useRouteError } from "@remix-run/react";
import { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules";
import { useState } from "react";
import { StudentState, getUserStudentStates } from "~/models/studentState";
import FilterButton from "~/components/FilterButton";
import Title from "~/components/atoms/typography/Title";
import { authenticator } from "~/auth/authenticator.server";
import { Button } from "~/components/atoms/form";
import { Env } from "~/env.server";

export const meta: V2_MetaFunction = () => [
  { title: "학생부 편집 | MyMollu" },
];

type LoaderData = {
  currentUsername: string;
  states: StudentState[],
};

export const loader: LoaderFunction = async ({ context, request }) => {
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  return json<LoaderData>({
    currentUsername: sensei.username,
    states: await getUserStudentStates(context.env as Env, sensei.username),
  });
};

type Filter = {
  minimumTier: number;
};

export const ErrorBoundary: V2_ErrorBoundaryComponent = () => {
  const error = useRouteError() as any;
  console.error(error);
  return <p>{error.toString()}</p>
};

export default function EditPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { currentUsername } = loaderData;

  const [states, setstates] = useState<StudentState[]>(loaderData.states);
  const [filter, setFilter] = useState<Filter>({ minimumTier: 1 });

  return (
    <>
      <Title text="학생부 편집" />

      <div className="my-8">
        <p className="font-bold text-xl my-4">필터</p>
        <FilterButton
          label="3성 이하 감추기" active={filter.minimumTier === 3}
          onActivate={(activated) => setFilter({ minimumTier: activated ? 3 : 1 })}
        />
      </div>

      <div className="my-8">
        <p className="font-bold text-xl my-4">학생 목록</p>
        <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
          {states.filter(({ student }) => student.tier >= filter.minimumTier).map(({ student, owned }) => (
            <div
              key={`edit-students-${student.id}`}
              className={`hover:scale-105 cursor-pointer transition ${owned ? "grayscale-100" : "opacity-75 grayscale"}`}
              onClick={() => { setstates(states.map((s) => s.student.id === student.id ? { ...s, owned: !s.owned } : s)); }}
            >
              <img className="rounded-lg" src={student.imageUrl} alt={student.name} />
              <p className="text-center text-sm">{student.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="my-8">
        <Form method="post" action="/api/student-states">
          <input type="hidden" name="username" value={currentUsername} />
          <input type="hidden" name="states" value={JSON.stringify(states.filter(({ owned }) => owned))} />
          <Button type="submit" text="저장하기" color="primary" />
        </Form>
      </div>
    </>
  );
};
