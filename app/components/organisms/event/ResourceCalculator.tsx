import { NavArrowDown, NavArrowUp } from "iconoir-react";
import { useState } from "react";
import { SubTitle } from "~/components/atoms/typography";
import { ResourceCards } from "~/components/molecules/student";
import type { Pickup } from "~/models/event";
import type { Student } from "~/models/student";
import type { Equipment, StudentResource } from "~/models/student-resource";

type ResourceCalculatorProps = {
  pickups: (Pickup & { student: Student })[];
  resources: StudentResource[];
  loading: boolean;
}

export default function ResourceCalculator({ pickups, resources, loading }: ResourceCalculatorProps) {
  const [showing, setShowing] = useState(false);

  const pickupCounts = new Map<Pickup["type"], number>();
  const skillItems = new Map<Student["school"], number>();
  pickups.forEach(({ type, student }) => {
    const school = student.school === "srt" ? "valkyrie" : student.school;
    skillItems.set(school, (skillItems.get(school) ?? 0) + 1);
    pickupCounts.set(type, (pickupCounts.get(type) ?? 0) + 1);
  });

  const equipments = new Map<Equipment, number>();
  resources.flatMap((each) => each.equipments)
  resources.forEach((resource) => {
    resource.equipments.forEach((equipment) => {
      equipments.set(equipment, (equipments.get(equipment) ?? 0) + 1);
    });
  });

  return (
    <div className="max-w-3xl px-6 md:px-8 py-2 md:py-4 mx-auto bg-white bg-opacity-95 rounded-t-lg shadow-t-lg">
      <div className="flex items-center gap-x-2">
        <SubTitle className="flex-grow" text="필요 재화량" />
        {loading && <p className="text-sm text-neutral-500">저장중...</p>}
        <div onClick={() => setShowing((prev) => !prev)}>
          {showing ?
            <NavArrowDown className="w-6 h-6" strokeWidth={2} /> :
            <NavArrowUp   className="w-6 h-6" strokeWidth={2} />
          }
        </div>
      </div>
      {showing && (
        <div className="max-h-48 overflow-y-auto">
          <p className="font-bold">모집할 횟수</p>
          <p className="my-4 text-sm">
            한정 {pickupCounts.get("limited") ?? 0}회,&nbsp;
            페스 {pickupCounts.get("fes") ?? 0}회,&nbsp;
            통상 {pickupCounts.get("usual") ?? 0}회
          </p>

          <p className="font-bold">성장 재료</p>
          <ResourceCards
            cardProps={Array.from(skillItems, ([school, count]) => ({
              id: `school-${school}`,
              imageUrl: `https://assets.mollulog.net/assets/images/bds/${school}`,
              count,
            }))}
          />

          <p className="font-bold">장비</p>
          <ResourceCards
            cardProps={Array.from(equipments, ([equipment, count]) => ({
              id: `equipment-${equipment}`,
              imageUrl: `https://assets.mollulog.net/assets/images/equipments/${equipment}`,
              count,
            }))}
          />
        </div>
      )}
    </div>
  );
}
