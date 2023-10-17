import { SubTitle } from "~/components/atoms/typography";
import { MemoEditor } from "~/components/molecules/editor";
import { StudentCards } from "~/components/molecules/student";
import { PickupEvent } from "~/models/event";
import { Student } from "~/models/student";

type EventProps = {
  id: string;
  type: PickupEvent["type"];
  name: string;
  rerun?: boolean;
  pickups: { student: Student, rerun: boolean, type: PickupEvent["pickups"][0]["type"] }[];

  selectedStudentIds: string[];
  onSelect?: (studentId: string) => void;
  initialMemo?: string;
  onMemoUpdate?: (text: string) => void;
};

export default function Event(event: EventProps) {
  const { selectedStudentIds, onSelect, initialMemo, onMemoUpdate } = event;

  const eventLabelTexts = [];
  if (["event", "pickup"].includes(event.type)) {
    eventLabelTexts.push(event.rerun ? "복각" : "신규");
  }
  eventLabelTexts.push({
    "event": "이벤트",
    "immortal_event": "이벤트 상설화",
    "mini_event": "미니 이벤트",
    "fes": "페스 이벤트",
    "pickup": "모집",
    "campaign": "캠페인",
    "exercise": "종합전술시험",
    "main_story": "메인 스토리",
  }[event.type]);

  return (
    <div className="py-2">
      <p className="md:my-1 text-sm text-neutral-500">
        {eventLabelTexts.join(" ")}
        </p>
      <SubTitle text={event.name} className={`mt-0 mb-2`} />

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


      {onMemoUpdate && (
        <MemoEditor
          initialText={initialMemo ?? undefined}
          onUpdate={onMemoUpdate}
        />
      )}
    </div>
  );
}
