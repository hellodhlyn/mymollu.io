import { Link, Form } from "@remix-run/react";
import dayjs from "dayjs";
import { SubTitle } from "~/components/atoms/typography";
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
  return (
    <div key={uid} className="my-4 p-4 md:p-6 rounded-lg bg-neutral-100">
      <SubTitle className="my-0" text={event.name} />
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

     {editable && (
        <div className="flex items-center justify-end">
          <Link to={`/edit/pickups/${uid}`}>
            <span className="-mr-2 px-4 p-2 hover:bg-neutral-200 text-neutral-500 font-bold transition rounded-lg">
              편집
            </span>
          </Link>
          <Form method="delete">
            <input type="hidden" name="uid" value={uid} />
            <button className="-mr-2 px-4 p-2 hover:bg-neutral-200 text-red-500 font-bold transition rounded-lg">
              삭제
            </button>
          </Form>
        </div>
     )}
    </div>
  );
}
