import { Student } from "./student";
import raidData from "~/statics/raids.json";

export type RaidEvent = {
  id: string;
  type: "total-assault" | "elimination";
  name: string;
  boss: string;
  terrain: "indoor" | "outdoor" | "street";
  attackType: Student["attackType"];
  defenseType: Student["defenseType"] | null;
  since: string;
  until: string;
};

export function getAllTotalAssaults(): RaidEvent[] {
  return raidData.map((row) => ({
    ...row,
    type: row.type as RaidEvent["type"],
    terrain: row.terrain as RaidEvent["terrain"],
    attackType: row.attackType as RaidEvent["attackType"],
    defenseType: row.defenseType as RaidEvent["defenseType"],
  }));
}
