import type { ReactNode } from "react";
import { studentImageUrl } from "~/models/assets";

export type StudentCardProps = {
  studentId: string;
  name?: string;
  nameSize?: "small" | "normal";

  tier?: number | null;
  label?: ReactNode;

  selected?: boolean;
  grayscale?: boolean;
}

function visibileTier(tier: number): [number, boolean] {
  if (tier <= 5) {
    return [tier, false];
  } else {
    return [tier - 5, true];
  }
}

export default function StudentCard(
  { studentId, name, nameSize, tier, label, selected, grayscale }: StudentCardProps,
) {
  const showInfo = tier !== undefined || label !== undefined;
  const visibleNames = [];
  if (name === "하츠네 미쿠") {
    visibleNames.push("미쿠");
  } else if (name === "미사카 미코토") {
    visibleNames.push("미사카");
  } else if (name === "쇼쿠호 미사키") {
    visibleNames.push("쇼쿠호");
  } else if (name === "사텐 루이코") {
    visibleNames.push("사텐");
  } else if (name?.includes("(")) {
    const splits = name.split("(");
    visibleNames.push(splits[0], splits[1].replace(")", ""));
  } else if (name) {
    visibleNames.push(name);
  }

  return (
    <div className="my-1">
      <div className="relative">
        <img
          className={`rounded-lg ${selected ? "border border-4 border-blue-500" : ""} ${grayscale ? "grayscale opacity-75" : ""} transition`}
          src={studentImageUrl(studentId)}
          alt={name} loading="lazy"
        />
        {showInfo && (
          <div
            className="absolute bottom-0 right-0 flex flex-col items-center px-2 rounded-lg bg-black bg-opacity-75 text-center font-extrabold text-xs"
          >
            {(tier) && (
              <p className={`flex items-center ${visibileTier(tier)[1] ? "text-teal-300" : "text-yellow-300"}`}>
                {(tier <= 5) ?
                  <span className="mr-0.5">★</span> :
                  <img className="w-4 h-4 mr-0.5 inline-block" src="/icons/exclusive_weapon.png" alt="고유 장비" />
                }
                <span>{visibileTier(tier)[0]}</span>
              </p>
            )}
            {(label !== undefined) && label}
          </div>
        )}
      </div>
      {name && (
        <div className="mt-1 text-center leading-tight">
          <p className={nameSize === "small" ? "text-xs" : "text-sm"}>{visibleNames[0]}</p>
          {(visibleNames.length === 2) && <p className="text-xs">{visibleNames[1]}</p>}
        </div>
      )}
    </div>
  )
}
