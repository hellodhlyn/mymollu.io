import { User, UserPlus, Group, UserXmark } from "iconoir-react";
import { Link } from "react-router-dom";

type ProfileUsernameProps = {
  imageUrl: string | null;
  username: string;
  loading?: boolean;
  followability?: "followable" | "following" | "unable";
  following?: number;
  followers?: number;
  onFollow?: () => void;
  onUnfollow?: () => void;
};

export default function ProfileUsername({
  imageUrl, username, loading, followability, followers, following, onFollow, onUnfollow,
}: ProfileUsernameProps) {
  return (
    <div className="m-4 md:m-6 pb-4 md:pb-6 flex items-center">
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
        {(following !== undefined && followers !== undefined) && (
          <p className="text-sm">
            <Link to={`/@${username}/friends?tab=following`} className="hover-underline mr-2">
              {following} <span className="text-neutral-500">팔로잉</span>
            </Link>
            <Link to={`/@${username}/friends?tab=following`} className="hover-underline">
              {followers} <span className="text-neutral-500">팔로워</span>
            </Link>
          </p>
        )}
      </div>
      {(followability === "followable" && onFollow) && (
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
      {(followability === "following" && onUnfollow) && (
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
  );
}
