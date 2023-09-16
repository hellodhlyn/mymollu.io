import { redirect, type ActionFunction, type V2_MetaFunction } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { ArrowRight } from "iconoir-react";
import { Button, Input } from "~/components/atoms/form";
import Title from "~/components/atoms/typography/Title";

export const meta: V2_MetaFunction = () => {
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
      <Title text="학생부" />

      <div className="my-4 flex items-center text-xl">
        <span>다른 선생님의 학생부</span>
        <ArrowRight className="h-5 w-5 ml-1" strokeWidth={2} />
      </div>
        <Form method="post">
          <Input name="username" placeholder="@username" />
          <Button type="submit" text="찾기" color="primary" />
        </Form>
    </>
  );
}
