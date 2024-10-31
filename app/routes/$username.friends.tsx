import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { SparklesIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { SubTitle } from "~/components/atoms/typography";
import { FilterButtons } from "~/components/molecules/student";
import { ErrorPage } from "~/components/organisms/error";
import { SenseiList } from "~/components/organisms/sensei";
import { getFollowers, getFollowings } from "~/models/followership";
import type { Sensei } from "~/models/sensei";
import { getSenseiByUsername } from "~/models/sensei";

type LoaderData = {
  following: Sensei[];
  followers: Sensei[];
};

export const loader: LoaderFunction = async ({ params, context }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const env = context.cloudflare.env;
  const username = usernameParam.replace("@", "");
  const sensei = (await getSenseiByUsername(env, username))!;

  const [following, followers] = await Promise.all([
    getFollowings(env, sensei.id),
    getFollowers(env, sensei.id),
  ]);

  return json<LoaderData>({
    following,
    followers,
  });
};

export default function UserFollowing() {
  const { following, followers } = useLoaderData<LoaderData>();

  const [params, setParams] = useSearchParams();
  const [senseis, setSenseis] = useState<Sensei[]>(params.get("tab") === "followers" ? followers : following);
  useEffect(() => {
    setSenseis(params.get("tab") === "followers" ? followers : following);
  }, [params]);

  return (
    <div className="my-8">
      <SubTitle text="친구 목록" />
      <FilterButtons
        Icon={UsersIcon}
        buttonProps={[
          {
            text: "팔로잉",
            active: params.get("tab") !== "followers",
            onToggle: () => { setParams({ tab: "following" }, { replace: false }) },
          },
          {
            text: "팔로워",
            active: params.get("tab") === "followers",
            onToggle: () => { setParams({ tab: "followers" }, { replace: false }) },
          },
        ]}
        exclusive
      />

      {senseis.length === 0 ?
        <ErrorPage Icon={SparklesIcon} message="등록한 친구가 없어요 :(" /> :
        <SenseiList senseis={senseis} />
      }
    </div>
  );
}
