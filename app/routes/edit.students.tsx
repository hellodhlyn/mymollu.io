import { ActionFunction, LoaderFunction, V2_MetaFunction, json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData, useRouteError } from "@remix-run/react";
import { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules";
import { useEffect, useState } from "react";
import { StudentState, getUserStudentStates, updateStudentStates } from "~/models/studentState";
import { Button } from "~/components/atoms/form";
import { Env } from "~/env.server";
import { useStateFilter } from "~/components/organisms/student";
import { Authenticator } from "remix-auth";
import { Sensei } from "~/models/sensei";

export const meta: V2_MetaFunction = () => [
  { title: "학생 목록 관리 | MolluLog" },
];

type LoaderData = {
  currentUsername: string;
  states: StudentState[],
};

export const loader: LoaderFunction = async ({ context, request }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  return json<LoaderData>({
    currentUsername: sensei.username,
    states: (await getUserStudentStates(context.env as Env, sensei.username, true))!!,
  });
};

export const action: ActionFunction = async ({ context, request }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  const states = JSON.parse(formData.get("states") as string);
  await updateStudentStates(context.env as Env, sensei, states);
  return redirect(`/@${sensei.username}/students`);
}

export const ErrorBoundary: V2_ErrorBoundaryComponent = () => {
  const error = useRouteError() as any;
  console.error(error);
  return <p>{error.toString()}</p>
};

export default function EditPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { currentUsername } = loaderData;

  const [states, setStates] = useState<StudentState[]>(loaderData.states);
  const [StateFilter, filteredStates, setAllStatesToFilter] = useStateFilter(loaderData.states);

  useEffect(() => {
    setAllStatesToFilter(states);
  }, [states])

  return (
    <>
      {StateFilter}

      <div className="my-8">
        <p className="font-bold text-xl my-4">학생 목록</p>
        <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
          {filteredStates.map(({ student, owned }) => (
            <div
              key={`edit-students-${student.id}`}
              className={`hover:scale-105 cursor-pointer transition ${owned ? "grayscale-100" : "opacity-75 grayscale"}`}
              onClick={() => { setStates(states.map((s) => s.student.id === student.id ? { ...s, owned: !s.owned } : s)); }}
            >
              <img className="rounded-lg" src={student.imageUrl} alt={student.name} />
              <p className="text-center text-sm">{student.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="my-8">
        <Form method="post">
          <input type="hidden" name="states" value={JSON.stringify(states.filter(({ owned }) => owned))} />
          <Button type="submit" text="저장하기" color="primary" />
        </Form>
      </div>
    </>
  );
};
