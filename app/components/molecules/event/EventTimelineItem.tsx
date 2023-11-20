import { Link } from "@remix-run/react";
import { NavArrowRight } from "iconoir-react";
import { MultilineText } from "~/components/atoms/typography";
import { MemoEditor } from "~/components/molecules/editor";
import { StudentCards } from "~/components/molecules/student";
import type { Pickup, PickupEvent} from "~/models/event";
import { eventLabelsMap, pickupLabel } from "~/models/event";
import type { Student } from "~/models/student";

type EventProps = {
  id: string;
  type: PickupEvent["type"];
  name: string;
  rerun?: boolean;
  pickups: ({ student: Student } & Pick<Pickup, "type" | "rerun">)[];
  hasDetail: boolean;

  selectedStudentIds: string[];
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
      <p className="md:my-1 text-sm text-neutral-500">
        {eventLabelTexts.join(" ")}
      </p>

      {event.hasDetail ?
        (
          <Link to={`/events/${event.id}`} >
            <div className="mb-2 flex items-end group">
              <MultilineText
                className="font-bold text-lg md:text-xl group-hover:underline cursor-pointer"
                texts={event.name.split("\n")}
              />
              <NavArrowRight className="h-4 w-4 mb-1.5" strokeWidth={2} />
            </div>
          </Link>
        ) :
        (
          <MultilineText className="mb-2 font-bold text-lg md:text-xl" texts={event.name.split("\n")} />
        )
      }

      <StudentCards
        mobileGrid={5}
        cardProps={event.pickups.map((pickup) => {
          const { student } = pickup;
          const label = pickupLabel(pickup);
          const colorClass = pickup.rerun ? "text-white" : "text-yellow-500";

          return {
            id: student.id,
            name: student.name,
            selected: selectedStudentIds.includes(student.id),
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
