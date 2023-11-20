import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Outlet, isRouteErrorResponse, useLoaderData, useParams, useRouteError } from "@remix-run/react";
import { Title } from "~/components/atoms/typography";
import { ErrorPage } from "~/components/organisms/error";
import { Navigation } from "~/components/organisms/navigation";
import type { Env } from "~/env.server";
import { getSenseiByUsername } from "~/models/sensei";

type LoaderData = {
  username: string;
}

export const loader: LoaderFunction = async ({ params, context }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");
  const env = context.env as Env;
  if (!(await getSenseiByUsername(env, username))) {
    throw json(
      { error: { message: "해당하는 닉네임의 선생님을 찾을 수 없어요", data: { username } } },
      { status: 404 },
    );
  }

  return json<LoaderData>({
    username,
  });
};

export const ErrorBoundary = () => {
  const error = useRouteError();
  let username, message;
  if (isRouteErrorResponse(error)) {
    username = error.data.error.data.username;
    message = error.data.error.message;
  }

  return (
    <>
      {username && <Title text={`@${username}`} />}
      <ErrorPage message={message} />
    </>
  )
};

export default function User() {
  const { username } = useLoaderData<LoaderData>();
  const params = useParams();

  return (
    <>
      <Title text={`@${username}`} />
      <Navigation links={[
        { to: `/@${username}/`, text: "프로필" },
        { to: `/@${username}/friends`, text: "친구" },
        { to: `/@${username}/students`, text: "학생" },
        { to: `/@${username}/parties`, text: "편성" },
      ]} />
      <Outlet key={`user-${params.username}`} />
    </>
  );
}
