import dayjs from "dayjs";
import { useState } from "react";
import { ContentTimelineItem, ContentTimelineItemProps } from "~/components/molecules/content";
import type { EventType, RaidType } from "~/models/content";

export type ContentTimelineProps = {
  contents: {
    name: string;
    since: Date;
    until: Date;
    rerun: boolean;
    contentId: string;
    contentType: EventType | RaidType;
    pickups?: ContentTimelineItemProps["pickups"];
    raidInfo?: ContentTimelineItemProps["raidInfo"];
  }[];
};

type ContentGroup = {
  groupDate: Date;
  contents: ContentTimelineProps["contents"];
};

const contentOrders: (EventType | RaidType)[] = [
  "total_assault",
  "elimination",
  "unlimit",
  "fes",
  "main_story",
  "event",
  "immortal_event",
  "pickup",
  "campaign",
  "exercise",
  "mini_event",
  "guide_mission",
  "collab",
];

function groupContents(contents: ContentTimelineProps["contents"]): ContentGroup[] {
  const groups: { groupDate: dayjs.Dayjs, contents: ContentTimelineProps["contents"] }[] = [];

  const now = dayjs();
  contents.sort((a, b) => a.since.getTime() - b.since.getTime()).forEach((content) => {
    const since = dayjs(content.since);
    const groupDate = (since.isBefore(now) ? now : since).startOf("day");
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.groupDate.isSame(groupDate)) {
      lastGroup.contents.push(content);
    } else {
      groups.push({ groupDate, contents: [content] });
    }
  });

  return groups.map(({ groupDate, contents }) => ({
    groupDate: groupDate.toDate(),
    contents: contents.sort((a, b) => contentOrders.indexOf(a.contentType) - contentOrders.indexOf(b.contentType)),
  }));
}

export default function ContentTimeline({ contents }: ContentTimelineProps) {
  const [contentGroups, setContentGroups] = useState<ContentGroup[]>(groupContents(contents));

  const today = dayjs().startOf("day");
  return (
    <>
      {contentGroups.map((group) => {
        const groupDate = dayjs(group.groupDate);
        const isToday = groupDate.isSame(today, "day");
        return (
          <div key={groupDate.format("YYYY-MM-DD")}>
            {/* 날짜 구분자 영역 */}
            {isToday ? (
              <div className="ml-1 flex items-center border-l border-white">
                <div className="inline-block -ml-1.5 size-3 bg-red-600 rounded-full animate-pulse" />
                <span className="mx-2 font-bold text-red-600">
                  진행중인 컨텐츠
                </span>
              </div>
            ) : (
              <div className="ml-1 flex items-center border-l border-white">
                <div className="inline-block -ml-1.5 size-3 bg-neutral-500 rounded-full" />
                <span className="mx-2 font-bold text-neutral-500">
                  {groupDate.format("YYYY-MM-DD")}
                </span>
              </div>
            )}

            {/* 컨텐츠 목록 영역 */}
            <div className="ml-1 -my-4 p-4 md:px-6 border-l border-neutral-300">
              {group.contents.map((content) => (
                <ContentTimelineItem
                  key={content.contentId}
                  {...content}
                  remainingDays={isToday ? dayjs(content.until).diff(today, "day") : null}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
