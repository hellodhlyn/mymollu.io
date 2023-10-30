import { Link } from "@remix-run/react";
import { UserPlus, Group, RefreshDouble, UserXmark, User } from "iconoir-react";
import { Progress } from "~/components/atoms/profile";
import { ProgressProps } from "~/components/atoms/profile/Progress";

export type ProfileCardProps = {
  imageUrl: string | null;
  username: string;
  tierCounts: Map<number, number>;
  loading: boolean;
  followability: "followable" | "following" | "unable";
  onFollow: () => void;
  onUnfollow: () => void;
};

const colors: { [tier: number]: ProgressProps["color"] } = {
  1: "red",
  2: "orange",
  3: "yellow",
  4: "green",
  5: "cyan",
  6: "blue",
  7: "purple",
  8: "fuchsia",
};

export function ProfileCard({
  imageUrl, username, tierCounts,
  loading, followability, onFollow, onUnfollow,
}: ProfileCardProps) {
  let totalCount = 0;
  tierCounts.forEach((count) => { totalCount += count; });

  return (
    <div className="my-4 border border-neutral-100 rounded-lg shadow-lg">
      <div className="m-4 md:m-6 pb-4 md:pb-6 flex items-center border-b border-neutral-200">
        {imageUrl ?
          <img className="h-12 w-12 md:w-16 md:h-16 rounded-full" src={imageUrl ?? ""} alt={`${username}의 프로필`} /> :
          (
            <div className="h-12 w-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-700">
              <User className="h-8 w-8" strokeWidth={2} />
            </div>
          )
        }
        <div className="ml-2 md:ml-4 flex-grow">
          <p className="font-bold text-lg md:text-xl">@{username}</p>
          <p className="text-xs md:text-sm text-neutral-500">{totalCount}명의 학생을 모집함</p>
        </div>
        {(followability === "followable") && (
          <div
            className={`
              px-4 py-2 flex items-center text-white border border-2 border-neutral-900 bg-neutral-900
              ${loading ? "opacity-50" : "hover:bg-neutral-700 cursor-pointer"}
              rounded-full transition
            `}
            onClick={onFollow}
          >
            <UserPlus className="h-4 w-4 mr-1" strokeWidth={2} />
            <span className="text-sm">팔로우</span>
          </div>
        )}
        {(followability === "following") && (
          <div
            className={`
              px-4 py-2 flex items-center border border-2 border-neutral-900
              hover:border-red-500 hover:bg-red-500
              ${loading ? "opacity-50" : "hover:text-white cursor-pointer"}
              rounded-full transition group
            `}
            onClick={onUnfollow}
          >
            <Group className="h-4 w-4 mr-1 block group-hover:hidden" strokeWidth={2} />
            <span className="text-sm block group-hover:hidden">팔로우 중</span>
            <UserXmark className="h-4 w-4 mr-1 hidden group-hover:block" strokeWidth={2} />
            <span className="text-sm hidden group-hover:block">팔로우 해제</span>
          </div>
        )}
      </div>

      <div className="m-4 md:m-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((tier) => (
          <div key={`tier-${tier}`} className="my-2 text-neutral-700">
            <div className="flex">
              <div className="w-1/7 flex items-center">
                {(tier <= 5) ?
                  <span className="w-4 mr-1 inline-block text-yellow-500">★</span> :
                  <img className="w-4 h-4 mr-1 inline-block" src="/icons/exclusive_weapon.png" alt="고유 장비" />
                }
                <span className="w-3 inline-block mr-1">{tier <= 5 ? tier : tier - 5}</span>
                <span className="w-16 inline-block">- {tierCounts.get(tier) ?? 0}명</span>
              </div>
              <div className="flex-grow">
                <Progress ratio={(tierCounts.get(tier) ?? 0) / totalCount} color={colors[tier]} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link to={`/@${username}/students`}>
        <p className="m-4 md:m-6 text-right">전체학생 목록 →</p>
      </Link>
    </div>
  );
}
