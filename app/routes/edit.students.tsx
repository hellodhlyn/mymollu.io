import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { StudentState } from "~/models/student-state";
import { getUserStudentStates, updateStudentStates } from "~/models/student-state";
import { FloatingButton } from "~/components/atoms/form";
import type { Env } from "~/env.server";
import { useStateFilter } from "~/components/organisms/student";
import { StudentCards } from "~/components/molecules/student";
import { useToast } from "~/components/atoms/notification";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Callout } from "~/components/atoms/typography";

export const meta: MetaFunction = () => [
  { title: "모집 학생 관리 | MolluLog" },
];

type LoaderData = {
  currentUsername: string;
  states: StudentState[],
};

export const loader: LoaderFunction = async ({ context, request }) => {
  const env = context.env as Env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  return json<LoaderData>({
    currentUsername: sensei.username,
    states: (await getUserStudentStates(env, sensei.username))!,
  });
};

export type ActionData = {
  error?: { message: string };
};

export const action: ActionFunction = async ({ context, request }) => {
  const env = context.env as Env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  const states = JSON.parse(formData.get("states") as string);
  await updateStudentStates(env, sensei, states);
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
  const [StateFilter, filteredStates, updateStatesToFilter] = useStateFilter(loaderData.states, false, true, true);

  useEffect(() => {
    updateStatesToFilter(states);
  }, [states])

  const noOwned = states.every(({ owned }) => !owned);

  return (
    <>
      {StateFilter}

      <div className="my-8">
        <p className="font-bold text-xl my-4">모집 학생 관리</p>
        {noOwned && (
          <Callout className="my-4">
            <p>학생을 클릭하여 모집한 학생을 등록할 수 있어요</p>
          </Callout>
        )}
        <StudentCards
          cardProps={filteredStates.map(({ student, owned }) => ({
              studentId: student.id,
              name: student.name,
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
}
