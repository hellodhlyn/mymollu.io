import type { SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "~/env.server";
import { getDB } from "~/env.server";
import type { Database } from "~/schema";
import type { Sensei } from "./sensei";
import { UserRepo } from "./sensei";
import { createFollowingActivity } from "./user-activity";
import { deleteCache, fetchCached } from "./base";

export type Followership = Database["public"]["Tables"]["dev_followerships"]["Row"];
export type Relationship = {
  followed: boolean;
  following: boolean;
};

export async function follow(env: Env, followerId: number, followeeId: number) {
  const repo = new FollowershipRepo(env);
  await repo.create(followerId, followeeId);
  await createFollowingActivity(env, followerId, followeeId);
  await deleteCache(env, followersCacheKey(followeeId), followingCacheKey(followerId));
}

export async function unfollow(env: Env, followerId: number, followeeId: number) {
  const repo = new FollowershipRepo(env);
  await repo.deleteByFollowerIdAndFolloweeId(followerId, followeeId);
  await deleteCache(env, followersCacheKey(followeeId), followingCacheKey(followerId));
}

export async function getFollowers(env: Env, followeeId: number): Promise<Sensei[]> {
  return fetchCached(env, followersCacheKey(followeeId), async () => {
    const followershipRepo = new FollowershipRepo(env);
    const followerIds = (await followershipRepo.findAllBy("followeeId", followeeId)).map((each) => each.followerId);

    const userRepo = new UserRepo(env);
    return await userRepo.findAllByIn("id", followerIds);
  });
}

export async function getFollowing(env: Env, followerId: number): Promise<Sensei[]> {
  return fetchCached(env, followingCacheKey(followerId), async () => {
    const followershipRepo = new FollowershipRepo(env);
    const followeeIds = (await followershipRepo.findAllBy("followerId", followerId)).map((each) => each.followeeId);

    const userRepo = new UserRepo(env);
    return await userRepo.findAllByIn("id", followeeIds);
  });
}

function followersCacheKey(followeeId: number) {
  return `followerships:followers:${followeeId}`;
}

function followingCacheKey(followerId: number) {
  return `followerships:following:${followerId}`;
}

class FollowershipRepo {
  private db: SupabaseClient<Database>;
  private tableName: string;

  constructor(env: Env) {
    this.db = getDB(env);
    this.tableName = `${env.STAGE}_followerships`;
  }

  async create(followerId: number, followeeId: number) {
    const { error } = await this.table().insert({ followerId, followeeId });
    if (error) {
      throw error;
    }
  }

  async findAllBy(field: string, value: any): Promise<Followership[]> {
    const { data, error } = await this.table().select("*").eq(field, value);
    if (error || !data) {
      console.error(error);
      return [];
    }
    return data;
  }

  async deleteByFollowerIdAndFolloweeId(followerId: number, followeeId: number) {
    const { error } = await this.table().delete()
      .eq("followerId", followerId)
      .eq("followeeId", followeeId);
    if (error) {
      throw error;
    }
  }

  private table() {
    return this.db.from(this.tableName);
  }
}
