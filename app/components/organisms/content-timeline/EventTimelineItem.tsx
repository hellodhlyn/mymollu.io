import { TimelineItemHeader } from "~/components/molecules/content-timeline";
import { MemoEditor } from "~/components/molecules/editor";
import { StudentCards } from "~/components/molecules/student";
import { eventTypeLocale, pickupLabelLocale } from "~/locales/ko";
import type { AttackType, DefenseType, EventType, PickupType, Role } from "~/models/content";

export type EventTimelineItemProps = {
  eventId: string;
  eventType: EventType;
  name: string;
  rerun: boolean;
  pickups: {
    type: PickupType;
    rerun: boolean;
    student: {
      studentId: string | null;
      name: string;
      attackType?: AttackType;
      defenseType?: DefenseType;
      role?: Role;
      schaleDbId?: string;
    };
  }[];
  since: Date;
  until: Date;

  selectedStudentIds?: string[];
  onFavorite?: (studentId: string, favorited: boolean) => void;
  initialMemo?: string;
  onMemoUpdate?: (text: string) => void;
};

export default function EventTimelineItem(event: EventTimelineItemProps) {
  const { selectedStudentIds, onFavorite, initialMemo, onMemoUpdate } = event;

  const eventLabelTexts = [];
  if (["event", "pickup"].includes(event.eventType)) {
    eventLabelTexts.push(event.rerun ? "복각" : "신규");
  }
  eventLabelTexts.push(eventTypeLocale[event.eventType]);

  const detailedEvent = ["event", "immortal_event", "main_story"].includes(event.eventType);

  return (
    <div className="py-2">
     <TimelineItemHeader
        title={event.name}
        label={eventLabelTexts.join(" ")}
        since={event.since}
        until={event.until}
        link={detailedEvent ? `/events/${event.eventId}` : undefined}
     />

      <StudentCards
        mobileGrid={5}
        students={event.pickups.map(({ type, rerun, student }) => {
          const { studentId } = student;

          const label = pickupLabelLocale({ type, rerun });
          const colorClass = rerun ? "text-white" : "text-yellow-500";
          return {
            ...student,
            selected: studentId ? (selectedStudentIds ?? []).includes(studentId) : false,
            label: (
              <span className={`${colorClass}`}>{label}</span>
            ),
          }
        })}
        onFavorite={onFavorite}
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
