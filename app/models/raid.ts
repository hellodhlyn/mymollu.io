import dayjs from "dayjs";
import type { Student } from "./student";
import type { Env } from "~/env.server";
import { fetchStaticData } from "./statics";

export type RaidEvent = {
  id: string;
  type: "total-assault" | "elimination" | "unlimit";
  name: string;
  boss: string;
  terrain?: "indoor" | "outdoor" | "street";
  attackType?: Student["attackType"];
  defenseType?: Student["defenseType"] | null;
  since: string;
  until: string;
  imageUrl: string;
};

export async function getRaids(env: Env, filterPrevious: boolean = true): Promise<RaidEvent[]> {
  const raidData = await fetchStaticData<RaidEvent[]>(env, "raids.json") || [];
  return raidData
    .filter(({ until }) => !filterPrevious || dayjs(until).isAfter(dayjs()))
    .map((row) => ({
      ...row,
      type: row.type as RaidEvent["type"],
      terrain: row.terrain as RaidEvent["terrain"],
      attackType: row.attackType as RaidEvent["attackType"],
      defenseType: row.defenseType as RaidEvent["defenseType"],
      imageUrl: `https://assets.mollulog.net/assets/images/boss/${row.boss}`,
    }));
}

const terrainText = {
  "indoor": "실내",
  "outdoor": "야외",
  "street": "시가지",
};

export function raidTerrainText(terrain: NonNullable<RaidEvent["terrain"]>): string {
  return terrainText[terrain];
}

const typeText = {
  "total-assault": "총력전",
  "elimination": "대결전",
  "unlimit": "제약해제결전",
};

export function raidTypeText(type: NonNullable<RaidEvent["type"]>): string {
  return typeText[type];
}
