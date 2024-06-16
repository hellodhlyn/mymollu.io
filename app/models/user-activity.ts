import { nanoid } from "nanoid/non-secure";
import type { Env } from "~/env.server";
import { getSenseisById } from "./sensei";

type ActivityType = "following";

type DBUserActivity = {
  uid: string;
  userId: number;
  activityType: ActivityType;
  payload: string;
  createdAt: string;
};

type ActivityUser = {
  username: string;
  profileStudentId: string | null;
};

export type UserActivity = {
  uid: string;
  user: ActivityUser;
  activityType: ActivityType;
  eventAt: Date;
  following?: {
    followee: ActivityUser;
  };
};

export async function getUserActivities(env: Env): Promise<UserActivity[]> {
  const query = "select * from user_activities order by id desc";
  const result = await env.DB.prepare(query).all<DBUserActivity>();
  if (result.results.length === 0) {
    return [];
  }
  return toModels(env, result.results);
}

export async function getUserActivitiesBySensei(env: Env, senseiId: number): Promise<UserActivity[]> {
  const query = "select * from user_activities where userId = ?1 order by id desc";
  const result = await env.DB.prepare(query).bind(senseiId).all<DBUserActivity>();
  if (result.results.length === 0) {
    return [];
  }
  return toModels(env, result.results);
}

async function toModels(env: Env, results: DBUserActivity[]): Promise<UserActivity[]> {
  const senseiIds = [
    ...new Set(results.map((row) => row.userId)),
    ...new Set(results.filter((row) => row.activityType === "following").map((row) => JSON.parse(row.payload).followeeId)),
  ];

  const senseis = await getSenseisById(env, senseiIds);
  const senseisMap = new Map<number, ActivityUser>();
  senseis.forEach((sensei) => senseisMap.set(sensei.id, {
    username: sensei.username,
    profileStudentId: sensei.profileStudentId,
  }));

  return results.map((row) => {
    const activity: UserActivity = {
      uid: row.uid,
      user: senseisMap.get(row.userId)!,
      activityType: row.activityType,
      eventAt: new Date(row.createdAt),
    };

    if (row.activityType === "following") {
      activity.following = {
        followee: senseisMap.get(JSON.parse(row.payload).followeeId)!,
      };
    }
    return activity;
  });
}

export async function createFollowingActivity(env: Env, userId: number, followeeId: number) {
  const query = "insert into user_activities (uid, userId, activityType, payload) values (?1, ?2, ?3, ?4)";
  await env.DB.prepare(query).bind(nanoid(8), userId, "following", JSON.stringify({ followeeId })).run();
}
