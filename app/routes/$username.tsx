import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Outlet, useLoaderData, useParams } from "@remix-run/react";
import { Title } from "~/components/atoms/typography";
import { Navigation } from "~/components/organisms/navigation";

type LoaderData = {
  username: string;
}

export const loader: LoaderFunction = async ({ params }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");

  return json<LoaderData>({
    username,
  });
};

export default function Edit() {
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
