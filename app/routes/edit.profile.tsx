import type { ActionFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { ProfileEditor } from "~/components/organisms/profile";
import type { Env } from "~/env.server";
import { getAuthenticator, sessionStorage } from "~/auth/authenticator.server";
import { updateSensei } from "~/models/sensei";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import type { ProfileStudentsQuery } from "~/graphql/graphql";

export const profileStudentsQuery = graphql(`
  query ProfileStudents {
    students { studentId name }
  }
`)

export const meta: MetaFunction = () => [
  { title: "프로필 관리 | MolluLog" },
];

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const { data } = await runQuery<ProfileStudentsQuery>(profileStudentsQuery, {});
  if (!data?.students) {
    throw new Error("failed to load students");
  }

  return json({ sensei, students: data.students });
}

type ActionData = {
  error?: { username?: string };
}

export const action: ActionFunction = async ({ request, context }) => {
  const env = context.env as Env;
  const authenticator = getAuthenticator(env);
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  sensei.username = formData.get("username") as string;
  sensei.profileStudentId = formData.has("profileStudentId") ? formData.get("profileStudentId") as string : null;
  if (!/^[a-zA-Z0-9_]{4,20}$/.test(sensei.username)) {
    return json<ActionData>({ error: { username: "4~20글자의 영숫자 및 _ 기호만 사용 가능합니다." } })
  }

  await updateSensei(env, sensei.id, sensei);

  const { getSession, commitSession } = sessionStorage(env);
  const session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, sensei);
  return redirect(`/@${sensei.username}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function EditProfile() {
  const { sensei, students } = useLoaderData<typeof loader>();
  return (
    <div className="py-4">
      <Form method="post">
        <ProfileEditor
          students={students}
          initialData={sensei}
          error={useActionData<ActionData>()?.error}
        />
      </Form>
    </div>
  );
}
