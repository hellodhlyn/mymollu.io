import { redirect, json } from "@remix-run/cloudflare";
import type { LoaderFunction, type ActionFunction, type MetaFunction } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { Button, Input } from "~/components/atoms/form";
import { SubTitle } from "~/components/atoms/typography";
import { ActivityTimeline } from "~/components/organisms/activity";
import type { Env } from "~/env.server";
import type { UserActivity} from "~/models/user-activity";
import { getUserActivities } from "~/models/user-activity";

export const meta: MetaFunction = () => {
  return [
    { title: "MolluLog" },
    { name: "description", content: "블루 아카이브 학생 목록과 성장 상태를 공유해보세요." },
  ];
};

type LoaderData = {
  userActivities: UserActivity[];
};

export const loader: LoaderFunction = async ({ context }) => {
  const env = context.env as Env;
  return json<LoaderData>({
    userActivities: await getUserActivities(env),
  });
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  return redirect(`/@${username.replace("@", "")}`);
};

export default function Index() {
  const { userActivities } = useLoaderData<LoaderData>();
  return (
    <>
      <SubTitle text="선생님 찾기" />
      <p className="text-neutral-500">닉네임을 입력해 다른 선생님의 프로필을 확인해보세요</p>
      <Form className="flex" method="post">
        <Input name="username" placeholder="@username" />
        <Button type="submit" text="찾기" color="primary" />
      </Form>

      <SubTitle text="타임라인" />
      <ActivityTimeline activities={userActivities} showProfile />
    </>
  );
}
