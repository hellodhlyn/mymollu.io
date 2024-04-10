import dayjs from "dayjs";
import { MemoEditor } from "~/components/molecules/editor";
import { StudentCards } from "~/components/molecules/student";
import type { Pickup, GameEvent} from "~/models/event";
import { detailedEvent, eventLabelsMap, pickupLabel } from "~/models/event";
import type { StudentMap } from "~/models/student";
import { TimelineItemHeader } from "./TimelineItemHeader";

type EventProps = {
  id: string;
  type: GameEvent["type"];
  name: string;
  rerun?: boolean;
  pickups: Pickup[];
  students: StudentMap;
  since: string;
  until: string;

  selectedStudentIds?: string[];
  onSelect?: (studentId: string) => void;
  initialMemo?: string;
  onMemoUpdate?: (text: string) => void;
};

export default function EventTimelineItem(event: EventProps) {
  const { selectedStudentIds, onSelect, initialMemo, onMemoUpdate } = event;

  const eventLabelTexts = [];
  if (["event", "pickup"].includes(event.type)) {
    eventLabelTexts.push(event.rerun ? "복각" : "신규");
  }
  eventLabelTexts.push(eventLabelsMap[event.type]);


  return (
    <div className="py-2">
     <TimelineItemHeader
        title={event.name}
        label={eventLabelTexts.join(" ")}
        eventSince={dayjs(event.since)}
        eventUntil={dayjs(event.until)}
        link={detailedEvent(event.type) ? `/events/${event.id}` : undefined}
     />

      <StudentCards
        mobileGrid={5}
        cardProps={event.pickups.map((pickup) => {
          const label = pickupLabel(pickup);
          const colorClass = pickup.rerun ? "text-white" : "text-yellow-500";
          if (pickup.studentId === "-1") {
            return {
              id: pickup.studentId,
              name: pickup.name,
              selected: false,
              label: <span className={`${colorClass}`}>{label}</span>,
            };
          }

          const student = event.students[pickup.studentId];
          return {
            id: student.id,
            name: student.name,
            selected: (selectedStudentIds ?? []).includes(student.id),
            label: (
              <span className={`${colorClass}`}>{label}</span>
            ),
          }
        })}
        onSelect={onSelect}
      />


      {onMemoUpdate && (
        <MemoEditor
          initialText={initialMemo ?? undefined}
          onUpdate={onMemoUpdate}
        />
      )}
    </div>
  );
}
