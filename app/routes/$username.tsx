import { LoaderFunction, json } from "@remix-run/cloudflare";
import { Outlet, useLoaderData, useParams } from "@remix-run/react";
import { authenticator } from "~/auth/authenticator.server";
import { Title } from "~/components/atoms/typography";
import { Navigation } from "~/components/organisms/navigation";

type LoaderData = {
  username: string;
  currentUsername: string | null;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");
  const sensei = await authenticator.isAuthenticated(request);
  return json<LoaderData>({
    username,
    currentUsername: sensei?.username || null,
  });
};

export default function Edit() {
  const { username, currentUsername } = useLoaderData<LoaderData>();
  const params = useParams();

  return (
    <>
      <Title text={(username === currentUsername) ? "나의 학생부" : `@${username}의 학생부`} />
      <Navigation links={[
        { to: `/@${username}/students`, text: "학생 목록" },
        { to: `/@${username}/parties`, text: "부대 편성" },
      ]} />
      <Outlet key={`user-${params.username}`} />
    </>
  );
}
