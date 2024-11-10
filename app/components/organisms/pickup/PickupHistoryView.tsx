import dayjs from "dayjs";
import { SubTitle } from "~/components/atoms/typography";
import ActionCard, { ActionCardAction } from "~/components/molecules/editor/ActionCard";
import { StudentCards } from "~/components/molecules/student";
import { EventTypeEnum } from "~/graphql/graphql";
import { eventTypeLocale } from "~/locales/ko";

type PickupHistoryViewProps = {
  uid: string;
  event: {
    name: string;
    type: EventTypeEnum;
    since: Date;
  };
  students: {
    studentId: string;
    name: string;
  }[];
  pickupStudentIds: string[];
  editable?: boolean;
};

export default function PickupHistoryView({ uid, event, students, pickupStudentIds, editable }: PickupHistoryViewProps) {
  const actions: ActionCardAction[] = [];
  if (editable) {
    actions.push({ text: "편집", color: "default", link: `/edit/pickups/${uid}` });
    actions.push({ text: "삭제", color: "red", form: { method: "delete", hiddenInputs: [{ name: "uid", value: uid }] } });
  }

  return (
    <ActionCard actions={actions}>
      <div className="-my-4">
        <SubTitle text={event.name} />
      </div>
      <p className="text-neutral-500 text-sm">
        {eventTypeLocale[event.type]} | {dayjs(event.since).format("YYYY-MM-DD")}
      </p>
      <p className="mt-4 mb-2 font-bold">모집한 ★3 학생</p>
      <StudentCards
        pcGrid={10}
        students={students.map(({ studentId, name }) => ({
          studentId,
          name,
          label: pickupStudentIds.includes(studentId) ? <span className="text-yellow-500">픽업</span> : undefined,
        }))}
      />
    </ActionCard>
  );
}
