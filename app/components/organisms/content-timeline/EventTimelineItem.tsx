import { TimelineItemHeader } from "~/components/molecules/content-timeline";
import { MemoEditor } from "~/components/molecules/editor";
import { StudentCards } from "~/components/molecules/student";
import { eventTypeLocale, pickupLabelLocale } from "~/locales/ko";
import type { EventType, PickupType } from "~/models/content";

export type EventTimelineItemProps = {
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

  selectedStudentIds?: string[];
  onSelect?: (studentId: string | null) => void;
  initialMemo?: string;
  onMemoUpdate?: (text: string) => void;
};

export default function EventTimelineItem(event: EventTimelineItemProps) {
  const { selectedStudentIds, onSelect, initialMemo, onMemoUpdate } = event;

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
        cardProps={event.pickups.map(({ type, rerun, studentId, studentName }) => {
          const label = pickupLabelLocale({ type, rerun });
          const colorClass = rerun ? "text-white" : "text-yellow-500";
          return {
            studentId: studentId || "unlisted",
            name: studentName,
            selected: studentId ? (selectedStudentIds ?? []).includes(studentId) : false,
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
