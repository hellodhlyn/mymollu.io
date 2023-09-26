import dayjs from "dayjs";
import { SubTitle } from "~/components/atoms/typography";
import { MemoEditor } from "~/components/molecules/editor";
import { StudentCards } from "~/components/molecules/student";
import { PickupEvent } from "~/models/event";
import { Student } from "~/models/student";

type EventsProps = {
  events: {
    id: string;
    type: PickupEvent["type"];
    name: string;
    rerun: boolean;
    since: Date | null;
    until: Date | null;
    pickups: { student: Student, rerun: boolean, type: PickupEvent["pickups"][0]["type"] }[];
  }[];
  selectedStudentIds: string[];
  initialMemos?: { [eventId: string]: string };
  onSelect?: (studentId: string) => void;
  onMemoUpdate?: (eventId: string, text: string) => void;
}

function formatDate(date: Date | null): string {
  return date ? dayjs(date).format("YYYY-MM-DD") : "???";
}

export default function Events({
  events, selectedStudentIds, initialMemos, onSelect, onMemoUpdate,
}: EventsProps) {
  return (
    events.map((event) => {
      const eventLabelTexts = [];
      eventLabelTexts.push(event.rerun ? "복각" : "신규");
      eventLabelTexts.push({
        "event": "이벤트",
        "mini_event": "미니 이벤트",
        "fes": "페스 이벤트",
        "pickup": "모집",
      }[event.type]);

      const { since, until } = event;
      const now = dayjs();
      const currentEvent = since && until && dayjs(since).isBefore(now) && dayjs(until).isAfter(now);

      return (
        <div key={`event-${event.id}`} className="my-8">
          <SubTitle text={event.name} />
          <div className="-mt-2 mb-4 flex items-center text-sm text-neutral-500">
            {currentEvent && (
              <div className="mr-2 pr-2 flex items-center border-r border-neutral-300">
                <div className="mr-1 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="text-red-500 text-sm font-bold">진행중</span>
              </div>
            )}
            <span className="pr-2 border-r border-neutral-300">
              {eventLabelTexts.join(" ")}
            </span>
            <span className="px-2">
              {formatDate(event.since)} ~ {formatDate(event.until)}
            </span>
          </div>

          {onMemoUpdate && (
            <MemoEditor
              initialText={initialMemos ? initialMemos[event.id] ?? undefined : undefined}
              onUpdate={(text) => onMemoUpdate(event.id, text)}
            />
          )}

          <StudentCards
            mobileGrid={5}
            cardProps={event.pickups.map((pickup) => {
              const { student } = pickup;
              const labelTexts: string[] = [];
              let colorClass = "text-white";
              if (pickup.type === "given") {
                labelTexts.push("배포");
              } else if (pickup.type === "limited") {
                labelTexts.push("한정");
              } else if (pickup.type === "fes") {
                labelTexts.push("페스");
              }

              if (pickup.type !== "given") {
                if (pickup.rerun) {
                  labelTexts.push("복각");
                } else {
                  labelTexts.push("신규");
                  colorClass = "text-yellow-500";
                }
              }

              return {
                id: student.id,
                name: student.name,
                imageUrl: student.imageUrl,
                selected: selectedStudentIds.includes(student.id),
                label: (
                  <span className={`${colorClass}`}>{labelTexts.join(" ")}</span>
                ),
              }
            })}
            onSelect={onSelect}
          />


        </div>
      );
    })
  )
}
