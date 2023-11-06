import { LoaderFunction, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { ChatBubbleEmpty, Group, User } from "iconoir-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SubTitle } from "~/components/atoms/typography";
import { FilterButtons } from "~/components/molecules/student";
import { ErrorPage } from "~/components/organisms/error";
import { Env } from "~/env.server";
import { getFollowers, getFollowing } from "~/models/followership";
import { Sensei, getSenseiByUsername } from "~/models/sensei";
import { Student, getAllStudents } from "~/models/student";

type LoaderData = {
  following: Sensei[];
  followers: Sensei[];
  students: Student[];
};

export const loader: LoaderFunction = async ({ params, context }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const env = context.env as Env;
  const username = usernameParam.replace("@", "");
  const sensei = (await getSenseiByUsername(env, username))!;

  return json<LoaderData>({
    following: await getFollowing(env, sensei.id),
    followers: await getFollowers(env, sensei.id),
    students: getAllStudents(),
  });
};

export default function UserFollowing() {
  const { following, followers, students } = useLoaderData<LoaderData>();

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
        const imageUrl = students.find((student) => student.id === sensei.profileStudentId)?.imageUrl ?? null;
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
