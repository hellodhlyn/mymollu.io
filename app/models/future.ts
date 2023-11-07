import type { Env } from "~/env.server";

export type FuturePlan = {
  studentIds: string[];
  memos?: { [eventId: string]: string };
}

export async function getFuturePlan(env: Env, userId: number): Promise<FuturePlan | null> {
  const rawPlan = await env.KV_USERDATA.get(futurePlanKey(userId));
  if (!rawPlan) {
    return null;
  }
  return JSON.parse(rawPlan);
}

export async function setFuturePlan(env: Env, userId: number, plan: FuturePlan) {
  await env.KV_USERDATA.put(futurePlanKey(userId), JSON.stringify(plan));
}

function futurePlanKey(userId: number): string {
  return `future-plan:id:${userId}`;
}
