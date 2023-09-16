import { LoaderFunction, json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { authenticator } from "~/auth/authenticator.server";
import { Button } from "~/components/atoms/form";
import { Title } from "~/components/atoms/typography";
import { SpecEditor } from "~/components/organisms/student";
import { Env } from "~/env.server";
import { StudentState, getUserStudentStates } from "~/models/studentState";

type LoaderData = {
  currentUsername: string;
  states: StudentState[];
}

export const loader: LoaderFunction = async ({ context, request }) => {
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  return json<LoaderData>({
    currentUsername: sensei.username,
    states: (await getUserStudentStates(context.env as Env, sensei.username, true))!!,
  });
};

export default function EditSpecs() {
  const loaderData = useLoaderData<LoaderData>();
  const [states, setStates] = useState(loaderData.states);

  return (
    <>
      <Title text="학생 성장 관리" />
      <SpecEditor
        initialStates={loaderData.states.filter(({ owned }) => owned)}
        onUpdate={(state) => {
          setStates((prev) => prev.map((prevState) => prevState.student.id === state.student.id ? state : prevState));
        }}
      />

      <div className="my-8">
        <Form method="post" action="/api/student-states">
          <input type="hidden" name="username" value={loaderData.currentUsername} />
          <input type="hidden" name="states" value={JSON.stringify(states.filter(({ owned }) => owned))} />
          <Button type="submit" text="저장하기" color="primary" />
        </Form>
      </div>
    </>
  );
}
