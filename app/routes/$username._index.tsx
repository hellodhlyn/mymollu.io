import { LoaderFunction, V2_MetaFunction, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { ChatBubbleError } from "iconoir-react";
import { SubTitle } from "~/components/atoms/typography";
import { ProfileCard } from "~/components/molecules/profile/ProfileCard";
import { Env } from "~/env.server";
import { getSenseiByUsername } from "~/models/sensei";
import { StudentState, getUserStudentStates } from "~/models/studentState";

type LoaderData = {
  username: string;
  profileStudentId: string | null;
  states: StudentState[] | null;
};

export const loader: LoaderFunction = async ({ context, params }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const env = context.env as Env;
  const username = usernameParam.replace("@", "");
  const sensei = await getSenseiByUsername(env, username)

  const states = await getUserStudentStates(env, username);
  return json<LoaderData>({
    username,
    profileStudentId: sensei?.profileStudentId ?? null,
    states,
  });
};

export const meta: V2_MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""} - 프로필 | MolluLog`.trim() },
    { name: "description", content: `${params.username} 선생님의 프로필과 최근 활동을 확인해보세요.` },
    { name: "og:title", content: `${params.username || ""} - 프로필 | MolluLog`.trim() },
    { name: "og:description", content: `${params.username} 선생님의 프로필과 최근 활동을 확인해보세요.` },
  ];
};

export default function UserIndex() {
  const { username, profileStudentId, states } = useLoaderData<LoaderData>();
  if (!states) {
    return <p className="my-8">선생님을 찾을 수 없어요. 다른 이름으로 검색해보세요.</p>
  }

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

  return (
    <div className="my-8">
      <div className="my-8">
        <SubTitle text="프로필 카드" />
        <ProfileCard
          username={username}
          imageUrl={imageUrl}
          tierCounts={tierCounts}
        />
      </div>

      <div className="md:my-8 my-16">
        <SubTitle text="최근 활동 내역" />
        <div className="my-16 w-full flex flex-col items-center justify-center text-neutral-500">
          <ChatBubbleError className="my-2 w-16 h-16" strokeWidth={2} />
          <p className="my-2 text-sm">최근 활동 내역이 없어요.</p>
        </div>
      </div>
    </div>
  );
}
