import type { ActionFunction } from "@remix-run/cloudflare";
import { Form, useNavigation } from "@remix-run/react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Button } from "~/components/atoms/form";
import { Title } from "~/components/atoms/typography";
import type { Env } from "~/env.server";

export const action: ActionFunction = async ({ request, context }) => {
  return getAuthenticator(context.env as Env).authenticate("google", request);
};

export default function SignIn() {
  const navigation = useNavigation();
  return (
    <>
      <p className="-my-8 md:-my-16 pb-16">로그인하고 학생 정보, 미래시 계획을 관리해보세요.</p>
      <div className="h-64 md:h-96 flex items-center md:justify-center">
        <div className="w-full max-w-md">
          <Title text="로그인" className="text-center" />
          <Form method="post">
            <Button className="w-full" type="submit" color="primary" disabled={navigation.formAction !== undefined}>
              <p>Google 계정으로 로그인</p>
            </Button>
            <p className="my-4 text-sm text-neutral-500 text-center">
              개인정보는 서버에 저장하지 않아요.
            </p>
          </Form>
        </div>
      </div>
    </>
  );
}
