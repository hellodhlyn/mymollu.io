import { ActionFunction } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { Authenticator } from "remix-auth";
import { Button, Input } from "~/components/atoms/form";
import { Title } from "~/components/atoms/typography";
import { Sensei } from "~/models/sensei";

export const action: ActionFunction = async ({ request, context }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  return await authenticator.authenticate("form", request, {
    successRedirect: "/my",
    failureRedirect: "/signin?state=failed",
  });
};

export default function SignIn() {
  return (
    <>
      <Title text="로그인" />
      <div className="my-8">
        <p className="my-4 text-gray-700">로그인 기능 구현 예정. 임시로 아이디만 사용합니다.</p>
        <Form method="post">
          <Input name="username" placeholder="아이디" />
          <Button type="submit" text="로그인" color="primary" />
        </Form>
      </div>
    </>
  );
}
