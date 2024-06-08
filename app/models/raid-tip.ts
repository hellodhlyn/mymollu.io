import type { Env} from "~/env.server";
import { getDB } from "~/env.server";

type RaidTip = {
  title: string;
  description: string | null;
  userId: number | null;
  parties: string[][] | null;
  sourceUrl: string | null;
};

export async function getRaidTipsByRaidId(env: Env, raidId: string): Promise<RaidTip[]> {
  const db = getDB(env);
  const { data, error } = await db.from(tableName(env)).select("*").eq("raidId", raidId);
  if (error || !data) {
    throw error ?? "failed to fetch raid tips";
  }

  return data.map((tip) => ({
    title: tip.title,
    description: tip.description,
    userId: tip.userId,
    parties: tip.parties as RaidTip["parties"],
    sourceUrl: tip.sourceUrl,
  }));
}

function tableName(env: Env): "dev_raid_tips" | "prod_raid_tips" {
  return env.STAGE === "dev" ? "dev_raid_tips" : "prod_raid_tips";
}
