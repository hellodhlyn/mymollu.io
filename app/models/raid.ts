import dayjs from "dayjs";
import type { Student } from "./student";
import { getDB, type Env } from "~/env.server";
import { fetchCached } from "./base";

export type RaidEvent = {
  id: string;
  type: "total-assault" | "elimination" | "unlimit";
  name: string;
  boss: string;
  terrain: "indoor" | "outdoor" | "street" | null;
  attackType: Student["attackType"] | null;
  defenseType: Student["defenseType"] | null;
  since: string;
  until: string;
};

const allRaidsKey = "cache:all-raids";

export async function getRaids(env: Env, filterPrevious: boolean = true): Promise<RaidEvent[]> {
  const allRaids = await fetchCached(env, allRaidsKey, async () => {
    const db = getDB(env);
    const { data, error } = await db.from("raids").select("*");
    if (error || !data) {
      throw error ?? "failed to fetch raids";
    }

    return data.filter((raid) => ((env.STAGE === "dev") || raid.visible)).map((raid) => ({
      ...raid,
      id: raid.raidId,
      type: raid.type as RaidEvent["type"],
      terrain: raid.terrain as RaidEvent["terrain"] ?? null,
      attackType: raid.attackType as Student["attackType"] ?? null,
      defenseType: raid.defenseType as Student["defenseType"] ?? null,
    }));
  }, 5 * 60);

  const now = dayjs();
  return allRaids.filter(({ until }) => !filterPrevious || dayjs(until).isAfter(now));
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

export function bossImageUrl(boss: string): string {
  return `https://assets.mollulog.net/assets/images/boss/${boss}`;
}

export function bossBannerUrl(boss: string): string {
  return `https://assets.mollulog.net/assets/images/boss-banner/${boss}`;
}
