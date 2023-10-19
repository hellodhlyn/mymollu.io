import { Form } from "@remix-run/react";
import dayjs from "dayjs";
import { Label } from "~/components/atoms/form";
import { StudentCard } from "~/components/atoms/student";
import { SubTitle } from "~/components/atoms/typography";
import { Party } from "~/models/party"
import { getAllTotalAssaults, raidTerrainText, raidTypeText } from "~/models/raid";
import { StudentState } from "~/models/studentState";

type PartyViewProps = {
  party: Party;
  studentStates: StudentState[];
  deletable?: boolean;
};

export default function PartyView({ party, studentStates, deletable }: PartyViewProps) {
  const units = Array.isArray(party.studentIds[0]) ? (party.studentIds as string[][]) : [party.studentIds as string[]];
  const raid = party.raidId ? getAllTotalAssaults(false).find(({ id }) => party.raidId === id) : null;
  return (
    <div className="my-4 px-4 md:px-6 py-2 rounded-lg bg-neutral-100">
      <SubTitle text={party.name} />
      {raid && (
        <div className="flex my-4 md:my-8 -mx-4 md:-mx-6">
          <img className="h-12 md:h-24 w-36 md:w-fit object-cover object-left" src={`/assets/images/boss/${raid.boss}`} />
          <div className="px-4 md:px-8 w-full flex flex-col justify-center">
            <p className="font-bold">
              {raid.name}
            </p>
            <p className="text-xs md:text-sm text-neutral-500">
              {raidTypeText(raid.type)} | {raidTerrainText(raid.terrain)} | {dayjs(raid.since).format("YYYY-MM-DD")}
            </p>
          </div>
        </div>
      )}

      {units.map((studentIds, index) => (
        <>
          {(units.length > 1) && <Label text={`${index + 1}번째 편성`} />}
          <div className="grid grid-cols-6 md:grid-cols-10 gap-1 md:gap-2">
            {studentIds.map((id) => studentStates.find((state) => state.student.id === id)!).map(({ student }) => (
              <StudentCard
                key={`student-${student.id}`}
                id={student.id}
                name={student.name}
                imageUrl={student.imageUrl}
              />
            ))}
          </div>
        </>
      ))}

      {deletable && (
        <Form method="post">
          <div className="my-2 flex justify-end">
            <input type="hidden" name="uid" value={party.uid} />
            <button className="-mr-2 px-4 p-2 hover:bg-neutral-200 text-red-500 font-bold transition rounded-lg">
              삭제
            </button>
          </div>
        </Form>
      )}
    </div>
  );
};
