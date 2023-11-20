import type { SupabaseClient } from "@supabase/supabase-js";
import type { Env} from "~/env.server";
import { getDB } from "~/env.server";
import type { SupabaseSchema } from "~/schema";
import { getSenseiById } from "./sensei";
import { nanoid } from "nanoid/non-secure";

type ActivityType = "following";

type ActivityUser = {
  username: string;
  profileStudentId: string | null;
};

type DBUserActivity = {
  uid: string;
  userId: number;
  activityType: ActivityType;
  payload: any;
  createdAt?: string;
};

export type UserActivity = {
  uid: string;
  user: ActivityUser;
  activityType: ActivityType;
  eventAt: string;
  following?: {
    followee: ActivityUser;
  };
};

export async function getUserActivities(env: Env, userId?: number): Promise<UserActivity[]> {
  const repo = new UserActivityRepo(env);
  const dbRows = await repo.getAll(userId);

  return Promise.all(dbRows.map(async (row) => {
    const activity: UserActivity = {
      uid: row.uid,
      user: await getActivityUser(env, row.userId),
      activityType: row.activityType,
      eventAt: row.createdAt!,
    };

    if (row.activityType === "following") {
      activity.following = {
        followee: await getActivityUser(env, row.payload.followeeId),
      };
    }
    return activity;
  }));
}

export async function createFollowingActivity(env: Env, userId: number, followeeId: number) {
  const repo = new UserActivityRepo(env);
  await repo.create({
    uid: nanoid(8),
    userId,
    activityType: "following",
    payload: { followeeId },
  });
}

async function getActivityUser(env: Env, userId: number): Promise<ActivityUser> {
  const user = await getSenseiById(env, userId);
  return {
    username: user!.username,
    profileStudentId: user!.profileStudentId,
  };
}

class UserActivityRepo {
  private db: SupabaseClient<SupabaseSchema>;
  private tableName: string;

  constructor(env: Env) {
    this.db = getDB(env);
    this.tableName = `${env.STAGE}_user_activities`;
  }

  async getAll(userId?: number): Promise<DBUserActivity[]> {
    let query = this.table().select("*");
    if (userId !== undefined) {
      query = query.eq("userId", userId);
    }

    const { data, error } = await query.order("id", { ascending: false });
    if (error || !data) {
      console.error(error);
      return [];
    }
    return data;
  }

  async create(row: DBUserActivity) {
    await this.table().insert(row);
  }

  private table() {
    return this.db.from(this.tableName);
  }
}
