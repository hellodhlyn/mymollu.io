import type { RaidEvent} from "~/models/raid";
import { raidTerrainText, raidTypeText } from "~/models/raid";
import { TimelineItemHeader } from "./TimelineItemHeader";
import dayjs from "dayjs";

export default function RaidTimelineItem(
  { name, type, terrain, attackType, defenseType, imageUrl, until }: RaidEvent,
) {
  let attackTypeText = "";
  let attackTypeClass = "";
  if (attackType === "explosive") {
    [attackTypeText, attackTypeClass] = ["폭발", "bg-gradient-to-r from-red-500 to-orange-400"];
  } else if (attackType === "piercing") {
    [attackTypeText, attackTypeClass] = ["관통", "bg-gradient-to-r from-amber-500 to-yellow-400"];
  } else if (attackType === "mystic") {
    [attackTypeText, attackTypeClass] = ["신비", "bg-gradient-to-r from-blue-500 to-sky-400"];
  } else if (attackType === "sonic")  {
    [attackTypeText, attackTypeClass] = ["진동", "bg-gradient-to-r from-purple-500 to-fuchsia-400"];
  }

  let defenseTypeText = "";
  let defenseTypeClass = "";
  if (defenseType === "light") {
    [defenseTypeText, defenseTypeClass] = ["경장갑", "bg-gradient-to-r from-red-500 to-orange-400"];
  } else if (defenseType === "heavy") {
    [defenseTypeText, defenseTypeClass] = ["중장갑", "bg-gradient-to-r from-amber-500 to-yellow-400"];
  } else if (defenseType === "special") {
    [defenseTypeText, defenseTypeClass] = ["특수장갑", "bg-gradient-to-r from-blue-500 to-sky-400"];
  } else if (defenseType === "elastic") {
    [defenseTypeText, defenseTypeClass] = ["탄력장갑", "bg-gradient-to-r from-purple-500 to-fuchsia-400"];
  }

  return (
    <div className="py-2">
      <TimelineItemHeader
        title={name}
        label={raidTypeText(type)}
        remainingDays={dayjs(until).diff(dayjs(), "day")}
      />

      {(type === "total-assault" || type === "elimination") && (
        <div className="relative md:w-3/5">
          <img
            className="mb-2 rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-300"
            src={imageUrl} alt={`총력전 보스 ${name}`} loading="lazy"
          />
          <div className="absolute bottom-0 right-0 flex gap-x-1 p-1 text-white text-sm">
            <span className="px-2 py-1 rounded-lg shadow-lg bg-gradient-to-r from-neutral-900 to-neutral-700">
              {raidTerrainText(terrain!)}
            </span>
            <span className={`px-2 py-1 rounded-lg shadow-lg ${attackTypeClass}`}>
              {attackTypeText}
            </span>
            {defenseTypeText && (
              <span className={`px-2 py-1 rounded-lg shadow-lg ${defenseTypeClass}`}>
                {defenseTypeText}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
