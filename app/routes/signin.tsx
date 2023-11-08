import type { ActionFunction } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Button } from "~/components/atoms/form";
import { Title } from "~/components/atoms/typography";
import type { Env } from "~/env.server";

export const action: ActionFunction = async ({ request, context }) => {
  return getAuthenticator(context.env as Env).authenticate("google", request);
};

export default function SignIn() {
  return (
    <>
      <div className="h-48 flex justify-center items-center">
        <div className="w-full max-w-md">
          <Title text="로그인" className="text-center" />
          <Form method="post">
            <Button className="w-full" type="submit" text="Google 계정으로 로그인" color="primary" />
            <p className="my-4 text-sm text-neutral-500 text-center">
              개인정보는 서버에 저장하지 않아요.
            </p>
          </Form>
        </div>
      </div>
    </>
  );
}
