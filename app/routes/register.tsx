import type { ActionFunction, LoaderFunction, MetaFunction} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { Authenticator } from "remix-auth";
import { Title } from "~/components/atoms/typography";
import type { Sensei } from "~/models/sensei";
import { updateSensei } from "~/models/sensei";
import type { Student } from "~/models/student";
import { getAllStudents } from "~/models/student";
import type { Env } from "~/env.server";
import { migrateStates } from "~/models/studentState";
import { sessionStorage } from "~/auth/authenticator.server";
import { migrateParties } from "~/models/party";
import { ProfileEditor } from "~/components/organisms/profile";

export const meta: MetaFunction = () => [
  { title: "학생 편성 관리 | MolluLog" },
];

type LoaderData = {
  allStudents: Student[];
};

export const loader: LoaderFunction = async ({ request, context }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  } else if (sensei.active) {
    return redirect(`/@${sensei.username}`);
  }

  return json<LoaderData>({ allStudents: getAllStudents() });
}

type ActionData = {
  error?: { username?: string };
}

export const action: ActionFunction = async ({ request, context }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
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

  const env = context.env as Env;
  await Promise.all([
    updateSensei(env, sensei.id, sensei),
    migrateStates(env, sensei.username, sensei.id),
    migrateParties(env, sensei.username, sensei.id),
  ]);

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
