import { LoaderFunction, MetaFunction, json } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ChatBubbleXmark } from "iconoir-react";
import { useEffect, useState } from "react";
import { Authenticator } from "remix-auth";
import { SubTitle } from "~/components/atoms/typography";
import { ProfileCard, ProfileCardProps } from "~/components/organisms/profile";
import { Env } from "~/env.server";
import { Relationship, getFollowers, getFollowing, getRelationship } from "~/models/followership";
import { Sensei, getSenseiByUsername } from "~/models/sensei";
import { StudentState, getUserStudentStates } from "~/models/studentState";
import { ActionData } from "./api.followerships";

type LoaderData = {
  username: string;
  currentUsername: string | null;
  relationship: Relationship;
  following: number;
  followers: number;
  profileStudentId: string | null;
  states: StudentState[] | null;
};

export const loader: LoaderFunction = async ({ context, request, params }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const env = context.env as Env;
  const username = usernameParam.replace("@", "");
  const sensei = (await getSenseiByUsername(env, username))!;

  // Get a relationship
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const currentUser = await authenticator.isAuthenticated(request);
  let relationship: Relationship = { followed: false, following: false };
  if (currentUser && sensei && (currentUser.id !== sensei.id)) {
    relationship = await getRelationship(env, currentUser.id, sensei.id);
  }

  const states = await getUserStudentStates(env, username);
  return json<LoaderData>({
    username,
    currentUsername: currentUser?.username ?? null,
    relationship,
    following: (await getFollowing(env, sensei.id)).length,
    followers: (await getFollowers(env, sensei.id)).length,
    profileStudentId: sensei?.profileStudentId ?? null,
    states,
  });
};

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""} - 프로필 | MolluLog`.trim() },
    { name: "description", content: `${params.username} 선생님의 프로필과 최근 활동을 확인해보세요.` },
    { name: "og:title", content: `${params.username || ""} - 프로필 | MolluLog`.trim() },
    { name: "og:description", content: `${params.username} 선생님의 프로필과 최근 활동을 확인해보세요.` },
  ];
};

export default function UserIndex() {
  const loaderData = useLoaderData<LoaderData>();
  const { username, currentUsername, profileStudentId, states } = loaderData;
  if (!states) {
    return <p className="my-8">선생님을 찾을 수 없어요. 다른 이름으로 검색해보세요.</p>
  }

  const [relationship, setRelationship] = useState(loaderData.relationship);
  const fetcher = useFetcher<ActionData>();
  useEffect(() => {
    if (fetcher.state !== "loading") {
      return;
    }

    if (fetcher.data?.error) {
      console.error(fetcher.data.error);
    } else {
      setRelationship((prev) => ({ ...prev, following: followability === "followable" }));
    }
  }, [fetcher]);

  let imageUrl: string | null = null;
  const tierCounts = new Map<number, number>();
  states!.forEach(({ student, tier, owned }) => {
    if (student.id === profileStudentId) {
      imageUrl = student.imageUrl;
    }
    if (owned) {
      const studentTier = tier ?? student.initialTier;
      tierCounts.set(studentTier, (tierCounts.get(studentTier) ?? 0) + 1);
    }
  });

  let followability: ProfileCardProps["followability"] = relationship.following ? "following" : "followable";
  if (currentUsername === username) {
    followability = "unable";
  }

  return (
    <div className="my-8">
      <div className="my-8">
        <ProfileCard
          username={username}
          imageUrl={imageUrl}
          tierCounts={tierCounts}
          followability={followability}
          followers={loaderData.followers}
          following={loaderData.following}
          loading={fetcher.state === "submitting"}
          onFollow={() => fetcher.submit({ username }, { method: "post", action: "/api/followerships" })}
          onUnfollow={() => fetcher.submit({ username }, { method: "delete", action: "/api/followerships" })}
        />
      </div>

      <div className="md:my-8 my-16">
        <SubTitle text="최근 활동" />
        <div className="my-16 md:my-24 w-full flex flex-col items-center justify-center text-neutral-500">
          <ChatBubbleXmark className="my-2 w-16 h-16" strokeWidth={2} />
          <p className="my-2 text-sm">최근 활동 내역이 없어요</p>
        </div>
      </div>
    </div>
  );
}
