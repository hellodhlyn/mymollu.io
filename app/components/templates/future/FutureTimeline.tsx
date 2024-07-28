import { TimelineItem } from "~/components/organisms/content-timeline";
import type { FuturePlan } from "~/models/future";
import dayjs from "dayjs";
import { useState } from "react";
import { FilterButtons } from "~/components/molecules/student";
import type { AttackType, DefenseType, EventType, PickupType, RaidType, Terrain } from "~/models/content";

type GameEvent = {
  eventId: string;
  eventType: EventType;
  name: string;
  rerun: boolean;
  pickups: {
    type: PickupType;
    rerun: boolean;
    studentId: string | null;
    studentName: string;
  }[];
  since: Date;
  until: Date;
};

type Raid = {
  raidId: string;
  raidType: RaidType;
  name: string;
  since: Date;
  until: Date;
  boss: string;
  terrain: Terrain;
  attackType: AttackType;
  defenseType: DefenseType;
};

type FutureTimelineProps = {
  events: GameEvent[];
  raids: Raid[];
  plan?: FuturePlan;

  onSelectStudent?: (studentId: string | null) => void;
  onMemoUpdate?: (memo: { [eventId: string]: string }) => void;
};

type TimelineItemData = {
  id: string;
  since: Date;
  until: Date;
  event?: GameEvent;
  raid?: Raid;
};

type Filter = {
  eventTypes: GameEvent["eventType"][];
  raid: boolean;
};

function dividerText(since: Date): string {
  const sinceDayjs = dayjs(since);
  const texts = [sinceDayjs.format("YYYY-MM-DD")];
  const dDay = sinceDayjs.startOf("day").diff(dayjs().startOf("day"), "day");
  if (0 < dDay && dDay <= 30) {
    texts.push(`(D-${dDay})`);
  } else if (dDay === 0) {
    texts.push("(D-Day)");
  }
  return texts.join(" ");
}

export default function FutureTimeline({
  events, raids, plan, onSelectStudent, onMemoUpdate,
}: FutureTimelineProps) {
  const [filter, setFilter] = useState<Filter>({
    eventTypes: [],
    raid: false,
  });

  const onToggleEvents = (activated: boolean, eventTypes: GameEvent["eventType"][]) => {
    setFilter((prev) => {
      if (activated) {
        return { ...prev, eventTypes: [...prev.eventTypes, ...eventTypes] };
      }
      return { ...prev, eventTypes: prev.eventTypes.filter((type) => !eventTypes.includes(type)) };
    });
  };

  const timelineItems: TimelineItemData[] = [
    ...raids.map((content) => ({ id: content.raidId, since: content.since, until: content.until, raid: content })),
    ...events.map((content) => ({ id: content.eventId, since: content.since, until: content.until, event: content })),
  ].filter((item: TimelineItemData) => {
    if (filter.eventTypes.length === 0 && !filter.raid) {
      return true;
    } else if (item.raid) {
      return filter.raid;
    } else if (item.event) {
      return filter.eventTypes.includes(item.event.eventType);
    }
    return false;
  }).sort((a, b) => dayjs(a.since).diff(b.since));

  const lastItem = timelineItems[timelineItems.length - 1];
  const eventUntil = dayjs((lastItem.event ?? lastItem.raid)!.until);
  let prevSince = dayjs(timelineItems[0].since);

  const now = dayjs();
  return (
    <>
      <p className="text-neutral-500 -mt-2 my-4">
        미래시는 일본 서버 일정을 바탕으로 추정된 것으로, 실제 일정과 다를 수 있습니다.
      </p>

      <div className="my-6">
        <FilterButtons buttonProps={[
          { text: "스토리", onToggle: (activated) => { onToggleEvents(activated, ["main_story"]) } },
          { text: "이벤트", onToggle: (activated) => { onToggleEvents(activated, ["event", "immortal_event", "fes", "collab", "mini_event"]) } },
          { text: "캠페인", onToggle: (activated) => { onToggleEvents(activated, ["campaign"]) } },
          { text: "총력전/대결전", onToggle: (activated) => { setFilter((prev) => ({ ...prev, raid: activated })); } },
        ]} />
      </div>

      {(timelineItems.length > 0 && dayjs(timelineItems[0].since).isBefore(dayjs())) ? (
        <div className="relative md:ml-2 flex items-center">
          <div className="absolute w-3 h-3 bg-red-600 rounded-full -left-1.5 border border-1 border-white animate-pulse" />
          <p className="ml-4 text-red-600 font-bold">진행중</p>
        </div>
      ) : (
        <div className="relative md:ml-2 flex items-center">
          <div className="absolute w-3 h-3 -left-1.5 border border-1 border-white bg-neutral-500 rounded-full" />
          <p className="ml-4 text-neutral-500 text-sm font-bold">{dividerText(timelineItems[0].since)}</p>
        </div>
      )}
      <div className="h-2 border-l md:ml-2 border-neutral-200 border-opacity-75" />

      {timelineItems.map((item) => {
        const selectable = onSelectStudent !== undefined;
        const showMemo = onMemoUpdate && item.event && item.event.pickups.length > 0;

        let showDivider = false;
        if (dayjs(item.since).isAfter(now) && !prevSince.startOf("day").isSame(dayjs(item.since).startOf("day"))) {
          showDivider = true;
          prevSince = dayjs(item.since);
        }

        return (
          <div key={item.id} className="relative border-l md:ml-2 border-neutral-200 border-opacity-75">
            {showDivider && (
              <div className="ml-4 flex items-center pt-8">
                <div className="absolute w-3 h-3 -left-1.5 border border-1 border-white bg-neutral-500 rounded-full" />
                <p className="py-2 text-neutral-500 text-sm font-bold">
                  {dividerText(item.since)}
                </p>
              </div>
            )}
            <div className="ml-4 md:ml-6">
              <TimelineItem 
                raid={item.raid}
                event={item.event && {
                  ...item.event,

                  selectedStudentIds: plan?.studentIds ?? [],
                  onSelect: selectable ? (studentId) => onSelectStudent(studentId) : undefined,
                  initialMemo: plan?.memos ? plan.memos[item.id] : undefined,
                  onMemoUpdate: showMemo ? ((text) => onMemoUpdate({ [item.id]: text })) : undefined,
                }}
              />
            </div>
          </div>
        );
      })}

      <div className="h-8 border-l md:ml-2 border-neutral-200 border-opacity-75" />
      <div className="relative md:ml-2 flex items-center">
        <div className="absolute w-3 h-3 bg-neutral-500 rounded-full -left-1.5 border border-1 border-white" />
        <p className="ml-4 text-neutral-500 text-sm font-bold">
          남은 미래시까지 D-{eventUntil.startOf("day").diff(dayjs().startOf("day"), "day")}
        </p>
      </div>
    </>
  );
}
