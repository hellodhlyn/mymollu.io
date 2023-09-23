import dayjs from "dayjs";
import { SubTitle } from "~/components/atoms/typography";
import { PickupEvent } from "~/models/event";
import { StudentCards } from "../student";
import { Student } from "~/models/student";

export type EventViewProps = {
  id: string;
  name: string;
  type: PickupEvent["type"];
  rerun: boolean;
  since: Date;
  until: Date;
  pickups: { student: Student, limited: boolean, rerun: boolean }[];
  givens: { student: Student, limited: boolean, rerun: boolean }[];
};

export default function EventView({
  name, type, rerun, since, until,
  pickups, givens,
}: EventViewProps) {
  const eventLabelTexts = [];
  eventLabelTexts.push(rerun ? "복각" : "신규");
  eventLabelTexts.push({
    "event": "이벤트",
    "mini_event": "미니 이벤트",
    "fes": "페스 이벤트",
    "pickup": "모집",
  }[type]);

  return (
    <div className="my-8">
      <SubTitle text={name} />
      <div className="-mt-2 mb-4 text-sm text-neutral-500">
        <span className="pr-2 border-r border-neutral-300">
          {eventLabelTexts.join(" ")}
        </span>
        <span className="pl-2">
          {dayjs(since).format("YYYY-MM-DD")} ~ {dayjs(until).format("YYYY-MM-DD")}
        </span>
      </div>

      <StudentCards
        mobileGrid={4}
        cardProps={[...pickups, ...givens].map((pickup) => {
          const { student } = pickup;
          const labelTexts: string[] = [];
          let colorClass = "text-white";
          if (givens.find((given) => given.student.id === student.id)) {
            labelTexts.push("배포");
          } else {
            if (pickup.rerun) {
              labelTexts.push("복각");
            } else {
              labelTexts.push("신규");
              colorClass = "text-yellow-500";
            }

            if (pickup.limited) {
              labelTexts.push("한정");
            }
          }

          return {
            id: student.id,
            name: student.name,
            imageUrl: student.imageUrl,
            tier: student.initialTier,
            label: (
              <span className={`${colorClass}`}>{labelTexts.join(" ")}</span>
            ),
          }
        })}
      />
    </div>
  );
}
