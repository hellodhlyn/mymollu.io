import { Form, Link } from "@remix-run/react";
import dayjs from "dayjs";
import { StudentCard } from "~/components/atoms/student";
import { SubTitle } from "~/components/atoms/typography";
import { raidTypeLocale, terrainLocale } from "~/locales/ko";
import type { RaidType, Terrain } from "~/models/content";
import type { Party } from "~/models/party"
import { bossImageUrl } from "~/models/assets";
import type { StudentState } from "~/models/student-state";

type PartyViewProps = {
  party: Party;
  studentStates: StudentState[];
  editable?: boolean;
  raids: {
    raidId: string;
    type: RaidType;
    name: string;
    boss: string;
    terrain: Terrain;
    since: Date;
  }[];
};

export default function PartyView({ party, studentStates, editable, raids }: PartyViewProps) {
  const units = Array.isArray(party.studentIds[0]) ? (party.studentIds as string[][]) : [party.studentIds as string[]];
  const raid = party.raidId ? raids.find(({ raidId }) => party.raidId === raidId) : null;
  let raidText;
  if (raid) {
    console.log(raid);
    raidText = [
      raidTypeLocale[raid.type],
      terrainLocale[raid.terrain],
      dayjs(raid.since).format("YYYY-MM-DD"),
    ].filter((text) => text).join(" | ");
  }

  return (
    <div className="my-4 px-4 md:px-6 py-2 rounded-lg bg-neutral-100">
      <SubTitle text={party.name} />
      {raid && (
        <div className="flex my-4 md:my-8 -mx-4 md:-mx-6">
          <img
            className="h-12 md:h-24 w-36 md:w-fit object-cover object-left bg-gradient-to-l from-white rounded-r-lg"
            src={bossImageUrl(raid.boss)}
            alt={`${raid.name} 이벤트`}
          />
          <div className="px-4 md:px-8 w-full flex flex-col justify-center">
            <p className="font-bold">
              {raid.name}
            </p>
            <p className="text-xs md:text-sm text-neutral-500">
              {raidText}
            </p>
          </div>
        </div>
      )}

      {units.map((studentIds) => (
        <div key={`unit-${studentIds.join(":")}`}>
          <div className="grid grid-cols-6 md:grid-cols-10 gap-1 md:gap-2">
            {studentIds.map((id) => studentStates.find((state) => state.student.id === id)!).map(({ student, owned, tier }) => (
              <StudentCard
                key={`student-${student.id}`}
                studentId={student.id}
                name={student.name}
                tier={owned ? (tier ?? student.initialTier) : undefined}
              />
            ))}
          </div>
        </div>
      ))}

      {editable && (
        <div className="my-2 flex items-center justify-end">
          <Link to={`/edit/parties/${party.uid}`}>
            <span className="-mr-2 px-4 p-2 hover:bg-neutral-200 text-neutral-500 font-bold transition rounded-lg">
              편집
            </span>
          </Link>
          <Form method="post">
            <input type="hidden" name="uid" value={party.uid} />
            <button className="-mr-2 px-4 p-2 hover:bg-neutral-200 text-red-500 font-bold transition rounded-lg">
              삭제
            </button>
          </Form>
        </div>
      )}
    </div>
  );
}
