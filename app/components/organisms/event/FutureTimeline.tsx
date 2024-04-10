import type { GameEvent } from "~/models/event";
import { EventTimelineItem, RaidTimelineItem } from "~/components/molecules/event";
import type { FuturePlan } from "~/models/future";
import type { StudentMap } from "~/models/student";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { RaidEvent } from "~/models/raid";
import { useState } from "react";
import { FilterButtons } from "~/components/molecules/student";

type EventsProps = {
  events: GameEvent[];
  raids: RaidEvent[];
  students: StudentMap;
  plan?: FuturePlan;

  onSelectStudent?: (studentId: string) => void;
  onMemoUpdate?: (memo: { [eventId: string]: string }) => void;
};

type TimelineItem = {
  id: string;
  since: Dayjs;
  until: Dayjs;
  event?: GameEvent;
  raid?: RaidEvent;
};

type Filter = {
  eventTypes: GameEvent["type"][];
  raid: boolean;
};

function dividerText(since: Dayjs): string {
  const texts = [since.format("YYYY-MM-DD")];
  const dDay = since.startOf("day").diff(dayjs().startOf("day"), "day");
  if (0 < dDay && dDay <= 30) {
    texts.push(`(D-${dDay})`);
  } else if (dDay === 0) {
    texts.push("(D-Day)");
  }
  return texts.join(" ");
}

export default function FutureTimeline({
  events, raids, students, plan, onSelectStudent, onMemoUpdate,
}: EventsProps) {
  const [filter, setFilter] = useState<Filter>({
    eventTypes: [],
    raid: false,
  });

  const onToggleEvents = (activated: boolean, eventTypes: GameEvent["type"][]) => {
    setFilter((prev) => {
      if (activated) {
        return { ...prev, eventTypes: [...prev.eventTypes, ...eventTypes] };
      }
      return { ...prev, eventTypes: prev.eventTypes.filter((type) => !eventTypes.includes(type)) };
    });
  };

  const timelineItems: TimelineItem[] = [
    ...raids.map((e) => ({ id: e.id, since: dayjs(e.since), until: dayjs(e.until), raid: e })),
    ...events.map((e) => ({ id: e.id, since: dayjs(e.since), until: dayjs(e.until), event: e })),
  ].filter((item: TimelineItem) => {
    if (filter.eventTypes.length === 0 && !filter.raid) {
      return true;
    } else if (item.raid) {
      return filter.raid;
    } else if (item.event) {
      return filter.eventTypes.includes(item.event.type);
    }
    return false;
  }).sort((a, b) => dayjs(a.since).diff(b.since));

  const lastItem = timelineItems[timelineItems.length - 1];
  const eventUntil = dayjs((lastItem.event ?? lastItem.raid)!.until);
  let prevSince = timelineItems[0].since;

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

      {(timelineItems.length > 0 && timelineItems[0].since.isBefore(dayjs())) ? (
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
        if (item.since.isAfter(now) && !prevSince.startOf("day").isSame(item.since.startOf("day"))) {
          showDivider = true;
          prevSince = item.since;
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
              {item.raid && <RaidTimelineItem {...item.raid} />}
              {item.event && (
                <EventTimelineItem
                  {...item.event}
                  pickups={item.event.pickups}
                  students={students}

                  selectedStudentIds={plan?.studentIds ?? []}
                  onSelect={selectable ? (studentId) => onSelectStudent(studentId) : undefined}

                  initialMemo={plan?.memos ? plan.memos[item.id] : undefined}
                  onMemoUpdate={showMemo ? ((text) => onMemoUpdate({ [item.id]: text })) : undefined}
                />
              )}
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
