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

  let prevSince = timelineItems[0].since;
  return (
    <>
      <div className="relative flex items-center">
        <div className="absolute w-3 h-3 bg-red-600 rounded-full -left-1.5 border border-1 border-white animate-pulse" />
        <p className="ml-4 text-red-600 font-bold">진행중</p>
      </div>
      {timelineItems.map((item) => {
        const selectable = onSelectStudent !== undefined;
        const showMemo = onMemoUpdate && item.event && item.event.pickups.length > 0;

        let showDivider = false;
        if (prevSince.format("YYYYMMDD") !== item.since.format("YYYYMMDD")) {
          showDivider = true;
          prevSince = item.since;
        }

        return (
          <div key={item.id} className="relative border-l border-neutral-200 border-opacity-75">
            {showDivider && (
              <div className="ml-4 flex items-center pt-4">
                <div className="absolute w-3 h-3 bg-neutral-500 rounded-full -left-1.5 border border-1 border-white" />
                <p className="py-2 text-neutral-500 text-sm font-bold">
                  {item.since.format("YYYY-MM-DD")}
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
    </>
  )

}
