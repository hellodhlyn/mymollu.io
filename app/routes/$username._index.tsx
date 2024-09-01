import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { defer } from "@remix-run/cloudflare";
import { Await, Link, useFetcher, useLoaderData } from "@remix-run/react";
import { Callout, SubTitle } from "~/components/atoms/typography";
import type { ProfileCardProps } from "~/components/organisms/profile";
import { ProfileCard } from "~/components/organisms/profile";
import type { Env } from "~/env.server";
import { getFollowers, getFollowings } from "~/models/followership";
import { getSenseiByUsername } from "~/models/sensei";
import { getUserStudentStates } from "~/models/student-state";
import type { ActionData } from "./api.followerships";
import { getAuthenticator } from "~/auth/authenticator.server";
import { getUserActivitiesBySensei } from "~/models/user-activity";
import { Timeline, TimelinePlaceholder } from "~/components/organisms/useractivity";
import { Suspense } from "react";
import { studentImageUrl } from "~/models/assets";

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const env = context.env as Env;
  const username = usernameParam.replace("@", "");
  const sensei = (await getSenseiByUsername(env, username))!;

  // Get a relationship
  const [following, followers] = await Promise.all([
    getFollowings(env, sensei.id),
    getFollowers(env, sensei.id),
  ]);

  const relationship = { followed: false, following: false };
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (currentUser) {
    relationship.followed = following.find((each) => each.id === currentUser.id) !== undefined;
    relationship.following = followers.find((each) => each.id === currentUser.id) !== undefined;
  }

  const states = await getUserStudentStates(env, username);
  return defer({
    username,
    currentUsername: currentUser?.username ?? null,
    relationship,
    following: following.length,
    followers: followers.length,
    profileStudentId: sensei?.profileStudentId ?? null,
    states,
    userActivities: getUserActivitiesBySensei(env, sensei.id),
  });
};

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""} - 프로필 | 몰루로그`.trim() },
    { name: "description", content: `${params.username} 선생님의 프로필과 최근 활동을 확인해보세요.` },
    { name: "og:title", content: `${params.username || ""} - 프로필 | 몰루로그`.trim() },
    { name: "og:description", content: `${params.username} 선생님의 프로필과 최근 활동을 확인해보세요.` },
  ];
};

export default function UserIndex() {
  const loaderData = useLoaderData<typeof loader>();
  const { username, currentUsername, profileStudentId, states, userActivities } = loaderData;

  let followability: ProfileCardProps["followability"] = loaderData.relationship.following ? "following" : "followable";
  if (currentUsername === username) {
    followability = "unable";
  }

  const fetcher = useFetcher<ActionData>();

  if (!states) {
    return <p className="my-8">선생님을 찾을 수 없어요. 다른 이름으로 검색해보세요.</p>
  }

  let imageUrl: string | null = null;
  if (profileStudentId !== null) {
    imageUrl = studentImageUrl(profileStudentId);
  }

  const tierCounts = new Map<number, number>();
  states!.forEach(({ student, tier, owned }) => {
    if (owned) {
      const studentTier = tier ?? student.initialTier;
      tierCounts.set(studentTier, (tierCounts.get(studentTier) ?? 0) + 1);
    }
  });

  const isNewbee = username === currentUsername && states.every(({ owned }) => !owned);

  return (
    <div className="my-8">
      {isNewbee && (
        <Callout className="my-8" emoji="✨">
          <span className="grow">모집한 학생을 등록해보세요.</span>
          <Link to="/edit/students" className="ml-1 underline">등록하러 가기 →</Link>
        </Callout>
      )}

      <div className="my-8">
        <ProfileCard
          username={username}
          imageUrl={imageUrl}
          tierCounts={tierCounts}
          followability={followability}
          followers={loaderData.followers}
          following={loaderData.following}
          loading={fetcher.state !== "idle"}
          onFollow={() => fetcher.submit({ username }, { method: "post", action: "/api/followerships" })}
          onUnfollow={() => fetcher.submit({ username }, { method: "delete", action: "/api/followerships" })}
        />
      </div>

      <div className="md:my-8 my-16">
        <SubTitle text="최근 활동" />
        <Suspense fallback={<TimelinePlaceholder />}>
          <Await resolve={userActivities}>
            {(userActivities) => <Timeline activities={userActivities} />}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
