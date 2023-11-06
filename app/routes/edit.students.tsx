import { ActionFunction, LoaderFunction, MetaFunction, json, redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { StudentState, getUserStudentStates, updateStudentStates } from "~/models/studentState";
import { FloatingButton } from "~/components/atoms/form";
import { Env } from "~/env.server";
import { useStateFilter } from "~/components/organisms/student";
import { Authenticator } from "remix-auth";
import { Sensei } from "~/models/sensei";
import { StudentCards } from "~/components/molecules/student";
import { useFetcher } from "react-router-dom";
import { useToast } from "~/components/atoms/notification";

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

export type ActionData = {
  error?: { message: string };
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
  return json<ActionData>({});
}

export default function EditPage() {
  const loaderData = useLoaderData<LoaderData>();
  const fetcher = useFetcher<ActionData>();
  const [Toast, showToast] = useToast({
    children: (
      <p>
        성공적으로 저장했어요.&nbsp;
        <Link to="/my?path=students">
          <span className="underline">학생 목록 보러가기 →</span>
        </Link>
      </p>
    ),
  });

  useEffect(() => {
    if (fetcher.state === "loading" && !fetcher.data?.error) {
      showToast();
    }
  }, [fetcher]);

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

      <fetcher.Form method="post">
        <input type="hidden" name="states" value={JSON.stringify(states.filter(({ owned }) => owned))} />
        <FloatingButton state={fetcher.state} />
      </fetcher.Form>

      {Toast}
    </>
  );
};
