import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { ChatBubbleEmpty, Group, User } from "iconoir-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SubTitle } from "~/components/atoms/typography";
import { FilterButtons } from "~/components/molecules/student";
import { ErrorPage } from "~/components/organisms/error";
import type { Env } from "~/env.server";
import { getFollowers, getFollowing } from "~/models/followership";
import type { Sensei} from "~/models/sensei";
import { getSenseiByUsername } from "~/models/sensei";
import { studentImageUrl } from "~/models/student";

type LoaderData = {
  following: Sensei[];
  followers: Sensei[];
};

export const loader: LoaderFunction = async ({ params, context }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const env = context.env as Env;
  const username = usernameParam.replace("@", "");
  const sensei = (await getSenseiByUsername(env, username))!;

  const [following, followers] = await Promise.all([
    getFollowing(env, sensei.id),
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
        Icon={Group}
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

      {senseis.length === 0 && (
        <ErrorPage Icon={ChatBubbleEmpty} message="등록한 친구가 없어요 :(" />
      )}
      {senseis.map((sensei) => {
        const imageUrl = sensei.profileStudentId ? studentImageUrl(sensei.profileStudentId) : null;
        return (
          <div key={`sensei-${sensei.username}`} className="w-full border-b last:border-0 border-neutral-100">
            <Link to={`/@${sensei.username}`}>
              <div className="p-2 md:p-4 flex items-center hover:bg-neutral-100 rounded-lg transition">
                {imageUrl ?
                  <img className="h-8 w-8 rounded-full" src={imageUrl ?? ""} alt={`${sensei.username}의 프로필`} /> :
                  (
                    <div className="h-8 w-8 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-700">
                      <User className="h-6 w-6" strokeWidth={2} />
                    </div>
                  )
                }
                <p className="ml-2">{sensei.username}</p>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
