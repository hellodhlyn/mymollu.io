import type { ActionFunction, LoaderFunction, MetaFunction} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Title } from "~/components/atoms/typography";
import { updateSensei } from "~/models/sensei";
import type { Student } from "~/models/student";
import { getStudents } from "~/models/student";
import type { Env } from "~/env.server";
import { getAuthenticator, sessionStorage } from "~/auth/authenticator.server";
import { ProfileEditor } from "~/components/organisms/profile";

export const meta: MetaFunction = () => [
  { title: "선생님 등록 | MolluLog" },
];

type LoaderData = {
  allStudents: Student[];
};

export const loader: LoaderFunction = async ({ request, context }) => {
  const env = context.env as Env;
  const sensei = await getAuthenticator(context.env as Env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  } else if (sensei.active) {
    return redirect(`/@${sensei.username}`);
  }

  return json<LoaderData>({ allStudents: await getStudents(env, true) });
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
  } else if (sensei.active) {
    return redirect(`/@${sensei.username}`);
  }

  const formData = await request.formData();
  sensei.active = true;
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

export default function Register() {
  const { allStudents } = useLoaderData<LoaderData>();
  return (
    <>
      <Title text="기본 정보 설정" />
      <Form method="post">
        <ProfileEditor allStudents={allStudents} error={useActionData<ActionData>()?.error} />
      </Form>
    </>
  );
}
