import type { RaidEvent} from "~/models/raid";
import { raidTerrainText, raidTypeText } from "~/models/raid";

export default function TotalAssault(
  { name, type, terrain, attackType, defenseType, imageUrl }: RaidEvent,
) {
  let attackTypeText = "";
  let attackTypeClass = "";
  if (attackType === "explosive") {
    [attackTypeText, attackTypeClass] = ["폭발", "bg-red-500"];
  } else if (attackType === "piercing") {
    [attackTypeText, attackTypeClass] = ["관통", "bg-yellow-500"];
  } else if (attackType === "mystic") {
    [attackTypeText, attackTypeClass] = ["신비", "bg-blue-500"];
  }

  let defenseTypeText = "";
  let defenseTypeClass = "";
  if (defenseType === "light") {
    [defenseTypeText, defenseTypeClass] = ["경장갑", "bg-red-500"];
  } else if (defenseType === "heavy") {
    [defenseTypeText, defenseTypeClass] = ["중장갑", "bg-yellow-500"];
  } else if (defenseType === "elastic") {
    [defenseTypeText, defenseTypeClass] = ["신비장갑", "bg-blue-500"];
  }

  return (
    <div className="py-2">
      <p className="md:my-1 text-sm text-neutral-500">
        {raidTypeText(type)}
      </p>
      <p className="mb-2 font-bold text-lg md:text-xl">{name}</p>

      <div className="relative md:w-3/5">
        <img
          className="mb-2 rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-300"
          src={imageUrl} alt={`총력전 보스 ${name}`} loading="lazy"
        />
        <div className="absolute bottom-0 right-0 flex gap-x-1 p-1">
          <span className="px-2 py-1 rounded-lg text-white text-sm bg-black bg-opacity-90">
            {raidTerrainText(terrain)}
          </span>
          <span className={`px-2 py-1 bg-black rounded-lg text-white text-sm bg-opacity-90 ${attackTypeClass}`}>
            {attackTypeText}
          </span>
          {defenseTypeText && (
            <span className={`px-2 py-1 bg-black rounded-lg text-white text-sm bg-opacity-90 ${defenseTypeClass}`}>
              {defenseTypeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
