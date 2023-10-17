import { PickupEvent } from "~/models/event";
import { Event, Raid } from "~/components/molecules/event";
import { FuturePlan } from "~/models/future";
import { Student } from "~/models/student";
import dayjs, { Dayjs } from "dayjs";
import { RaidEvent } from "~/models/raid";

type EventsProps = {
  events: PickupEvent[];
  totalAssaults: RaidEvent[];
  allStudents: Student[];
  plan: FuturePlan;

  onSelectStudent?: (studentId: string) => void;
  onMemoUpdate?: (memo: { [eventId: string]: string }) => void;
};

type TimelineItem = {
  id: string;
  since: Dayjs;
  event?: PickupEvent;
  totalAssault?: RaidEvent;
};

export default function FutureTimeline({
  events, totalAssaults, allStudents, plan, onSelectStudent, onMemoUpdate,
}: EventsProps) {
  const timelineItems: TimelineItem[] = [
    ...totalAssaults.map((e) => ({ id: e.id, since: dayjs(e.since), totalAssault: e })),
    ...events.map((e) => ({ id: e.id, since: dayjs(e.since), event: e })),
  ].sort((a, b) => dayjs(a.since).diff(b.since));

  const lastItem = timelineItems[timelineItems.length - 1];
  const eventUntil = dayjs((lastItem.event ?? lastItem.totalAssault)!.until);
  let prevSince = timelineItems[0].since;
  return (
    <>
      <p className="text-neutral-500 -mt-2 my-4">
        미래시는 일본 서버 일정을 바탕으로 추정된 것으로, 실제 일정과 다를 수 있습니다.
      </p>

      <div className="relative md:ml-2 flex items-center">
        <div className="absolute w-3 h-3 bg-red-600 rounded-full -left-1.5 border border-1 border-white animate-pulse" />
        <p className="ml-4 text-red-600 font-bold">진행중</p>
      </div>
      <div className="h-2 border-l md:ml-2 border-neutral-200 border-opacity-75" />

      {timelineItems.map((item) => {
        const selectable = onSelectStudent !== undefined;
        const showMemo = onMemoUpdate && item.event && item.event.pickups.length > 0;

        let showDivider = false;
        if (!prevSince.startOf("day").isSame(item.since.startOf("day"))) {
          showDivider = true;
          prevSince = item.since;
        }

        const dDay = item.since.startOf("day").diff(dayjs().startOf("day"), "day");

        return (
          <div key={item.id} className="relative border-l md:ml-2 border-neutral-200 border-opacity-75">
            {showDivider && (
              <div className="ml-4 flex items-center pt-4">
                <div className="absolute w-3 h-3 -left-1.5 border border-1 border-white bg-neutral-500 rounded-full " />
                <p className="py-2 text-neutral-500 text-sm font-bold">
                  {item.since.format("YYYY-MM-DD")}{(dDay <= 30) ? ` (D-${dDay})` : null}
                </p>
              </div>
            )}
            <div className="ml-4 md:ml-6">
              {item.totalAssault && <Raid {...item.totalAssault} />}
              {item.event && (
                <Event
                  {...item.event}
                  pickups={item.event.pickups.map((pickup) => ({
                    student: allStudents.find(({ id }) => pickup.studentId === id)!,
                    rerun: pickup.rerun,
                    type: pickup.type,
                  }))}

                  selectedStudentIds={plan.studentIds}
                  onSelect={selectable ? (studentId) => onSelectStudent(studentId) : undefined}

                  initialMemo={plan.memos ? plan.memos[item.id] : undefined}
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
