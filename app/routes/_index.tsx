import { redirect, type ActionFunction, type MetaFunction } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { ChatBubbleError } from "iconoir-react";
import { Button, Input } from "~/components/atoms/form";
import { SubTitle } from "~/components/atoms/typography";

export const meta: MetaFunction = () => {
  return [
    { title: "MolluLog" },
    { name: "description", content: "블루 아카이브 학생 목록과 성장 상태를 공유해보세요." },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  return redirect(`/@${username.replace("@", "")}`);
};

export default function Index() {
  return (
    <>
      <SubTitle text="선생님 찾기" />
      <p className="text-neutral-500">닉네임을 입력해 다른 선생님의 프로필을 확인해보세요</p>
      <Form className="flex" method="post">
        <Input name="username" placeholder="@username" />
        <Button type="submit" text="찾기" color="primary" />
      </Form>

      <SubTitle text="타임라인" />
      <div className="my-16 md:my-24 w-full flex flex-col items-center justify-center text-neutral-500">
        <ChatBubbleError className="my-2 w-16 h-16" strokeWidth={2} />
        <p className="my-2 text-sm">팔로워의 최근 활동 내역이 없어요</p>
      </div>
    </>
  );
}
