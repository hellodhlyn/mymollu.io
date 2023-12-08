import { Link } from "@remix-run/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { ChatBubbleXmark } from "iconoir-react";
import { ProfileImage } from "~/components/atoms/student";
import type { UserActivity } from "~/models/user-activity";

dayjs.extend(relativeTime);
dayjs.locale("ko");

type ActivityTimelineProps = {
  activities: UserActivity[],
  showProfile?: boolean;
}

function ActivityItem({ activity }: { activity: UserActivity }) {
  if (activity.activityType === "following") {
    const { followee } = activity.following!;
    return (
      <div className="my-2 p-4 bg-neutral-100 rounded-lg">
        <div className="flex items-center">
          <ProfileImage studentId={followee.profileStudentId} />
          <p className="ml-2">
            <Link to={`/@${followee.username}`} className="font-semibold hover:underline">
              <span>@{followee.username}</span>
            </Link>
            &nbsp;선생님을 팔로우합니다.
          </p>
        </div>
      </div>
    )
  }
  return null;
}

export default function ActivityTimeline({ activities, showProfile }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="my-16 md:my-24 w-full flex flex-col items-center justify-center text-neutral-500">
        <ChatBubbleXmark className="my-2 w-16 h-16" strokeWidth={2} />
        <p className="my-2 text-sm">최근 활동 내역이 없어요</p>
      </div>
    )
  }

  let previousUsername = "";
  return (
    <>
      {activities.map((activity) => {
        const eventAt = dayjs(activity.eventAt).fromNow();
        const repeatedUser = previousUsername === activity.user.username;
        previousUsername = activity.user.username;

        return (
          <div key={`activity-${activity.uid}`}>
            {(showProfile && !repeatedUser) && (
              <div className="mt-8 mb-2 px-2 flex items-center">
                <Link to={`/@${activity.user.username}`}>
                  <div className="flex items-center hover:underline cursor-pointer">
                    <ProfileImage studentId={activity.user.profileStudentId} imageSize={8} />
                    <span className="ml-2 font-semibold">{activity.user.username}</span>
                  </div>
                </Link>
                <span className="text-xs text-neutral-500 ml-2">{eventAt}</span>
              </div>
            )}
            <ActivityItem activity={activity} />
            {!showProfile && (
              <div className="flex justify-end">
                <p className="text-xs text-neutral-500 m-2">{eventAt}</p>
              </div>
            )}
          </div>
        )
      })}
    </>
  );
}
