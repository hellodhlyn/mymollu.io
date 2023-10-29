import { ActionFunction, LoaderFunction, MetaFunction, json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { StudentState, getUserStudentStates, updateStudentStates } from "~/models/studentState";
import { Button } from "~/components/atoms/form";
import { Env } from "~/env.server";
import { useStateFilter } from "~/components/organisms/student";
import { Authenticator } from "remix-auth";
import { Sensei } from "~/models/sensei";
import { StudentCards } from "~/components/molecules/student";

export const meta: MetaFunction = () => [
  { title: "모집 학생 관리 | MolluLog" },
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

export default function EditPage() {
  const loaderData = useLoaderData<LoaderData>();

  const [states, setStates] = useState<StudentState[]>(loaderData.states);
  const [StateFilter, filteredStates, setAllStatesToFilter] = useStateFilter(loaderData.states);

  useEffect(() => {
    setAllStatesToFilter(states);
  }, [states])

  return (
    <>
      {StateFilter}

      <div className="my-8">
        <p className="font-bold text-xl my-4">모집 학생 관리</p>
        <StudentCards
          cardProps={filteredStates.map(({ student, owned }) => ({
              id: student.id,
              name: student.name,
              imageUrl: student.imageUrl,
              grayscale: !owned,
          }))}
          onSelect={(id) => { setStates(states.map((s) => s.student.id === id ? { ...s, owned: !s.owned } : s)); }}
        />
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
