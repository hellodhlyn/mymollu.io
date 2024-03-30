import dayjs from "dayjs";
import "dayjs/locale/ko";
import { ChatBubbleXmark } from "iconoir-react";
import type { UserActivity } from "~/models/user-activity";
import { TimelineItem } from "~/components/molecules/useractivity";

type ActivityTimelineProps = {
  activities: UserActivity[],
  showProfile?: boolean;
}

export default function Timeline({ activities, showProfile }: ActivityTimelineProps) {
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
        const repeatedUser = previousUsername === activity.user.username;
        previousUsername = activity.user.username;

        return (
          <TimelineItem
            key={activity.uid}
            activity={activity}
            showProfile={showProfile && !repeatedUser}
            showTime={!repeatedUser}
          />
        );
      })}
    </>
  );
}
