import { Link } from "@remix-run/react";
import { User, UserPlus, Group, UserXmark } from "iconoir-react";
import { sanitizeClassName } from "~/prophandlers";

type ProfileUsernameProps = {
  imageUrl: string | null;
  username: string;
  friendCode: string | null;
  loading?: boolean;
  followability?: "followable" | "following" | "unable";
  following: number;
  followers: number;
  onFollow?: () => void;
  onUnfollow?: () => void;
};

export default function ProfileUsername({
  imageUrl, username, friendCode, loading, followability, followers, following, onFollow, onUnfollow,
}: ProfileUsernameProps) {
  return (
    <div className="m-4 md:m-6 pb-4 md:pb-6 flex items-center">
      {imageUrl ?
        <img className="h-12 w-12 md:w-16 md:h-16 rounded-full object-cover" src={imageUrl ?? ""} alt={`${username}의 프로필`} /> :
        (
          <div className="h-12 w-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-700">
            <User className="h-8 w-8" strokeWidth={2} />
          </div>
        )
      }
      <div className="ml-2 md:ml-4 flex-grow">
        <p className="font-bold text-lg md:text-xl">@{username}</p>
        <p className="text-sm">
          <Link to={`/@${username}/friends?tab=following`} className="hover:underline mr-2">
            {following} <span className="text-neutral-500">팔로잉</span>
          </Link>
          <Link to={`/@${username}/friends?tab=following`} className="hover:underline mr-2">
            {followers} <span className="text-neutral-500">팔로워</span>
          </Link>
        </p>
        {friendCode && (
          <p className="text-sm">
            <span className="text-neutral-500">친구 코드 </span>
            <span>{friendCode}</span>
          </p>
        )}
      </div>
      {(followability === "followable" && onFollow) && (
        <button
          type="button"
          className={sanitizeClassName(`
            px-4 py-2 flex items-center text-white border border-2 border-neutral-900 bg-neutral-900 rounded-full transition
            disabled:opacity-50 hover:bg-neutral-700
          `)}
          onClick={onFollow}
          disabled={loading}
        >
          <UserPlus className="h-4 w-4 mr-1" strokeWidth={2} />
          <span className="text-sm">팔로우</span>
        </button>
      )}
      {(followability === "following" && onUnfollow) && (
        <button
          type="button"
          className={sanitizeClassName(`
            px-4 py-2 flex items-center border border-2 border-neutral-900 rounded-full transition group
            disabled:opacity-50 hover:border-red-500 hover:bg-red-500 hover:text-white
          `)}
          onClick={onUnfollow}
          disabled={loading}
        >
          <Group className="h-4 w-4 mr-1 block group-hover:hidden" strokeWidth={2} />
          <span className="text-sm block group-hover:hidden">팔로우 중</span>
          <UserXmark className="h-4 w-4 mr-1 hidden group-hover:block" strokeWidth={2} />
          <span className="text-sm hidden group-hover:block">팔로우 해제</span>
        </button>
      )}
    </div>
  );
}
