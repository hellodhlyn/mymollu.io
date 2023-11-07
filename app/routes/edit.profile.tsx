import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { Authenticator } from "remix-auth";
import { ProfileEditor } from "~/components/organisms/profile";
import type { Env } from "~/env.server";
import { sessionStorage } from "~/auth/authenticator.server";
import type { Sensei} from "~/models/sensei";
import { updateSensei } from "~/models/sensei";
import type { Student} from "~/models/student";
import { getAllStudents } from "~/models/student";

export const meta: MetaFunction = () => [
  { title: "프로필 관리 | MolluLog" },
];

type LoaderData = {
  sensei: Sensei;
  allStudents: Student[];
};

export const loader: LoaderFunction = async ({ context, request }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  return json<LoaderData>({ sensei, allStudents: getAllStudents() });
}

type ActionData = {
  error?: { username?: string };
}

export const action: ActionFunction = async ({ request, context }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
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

  const env = context.env as Env;
  await updateSensei(env, sensei.id, sensei);

  const { getSession, commitSession } = sessionStorage(env);
  const session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, sensei);
  return redirect(`/@${sensei.username}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function EditProfile() {
  const { sensei, allStudents } = useLoaderData<LoaderData>();
  return (
    <div className="py-4">
      <Form method="post">
        <ProfileEditor
          allStudents={allStudents}
          initialData={sensei}
          error={useActionData<ActionData>()?.error}
        />
      </Form>
    </div>
  );
}
