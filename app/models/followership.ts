import type { SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "~/env.server";
import { getDB } from "~/env.server";
import type { SupabaseSchema } from "~/schema";
import type { Sensei } from "./sensei";
import { UserRepo } from "./sensei";
import { createFollowingActivity } from "./user-activity";

export type Followership = SupabaseSchema["public"]["Tables"]["dev_followerships"]["Row"];
export type Relationship = {
  followed: boolean;
  following: boolean;
};

export async function follow(env: Env, followerId: number, followeeId: number) {
  const repo = new FollowershipRepo(env);
  await repo.create(followerId, followeeId);
  await createFollowingActivity(env, followerId, followeeId);
  await env.KV_USERDATA.delete(followersCacheKey(followeeId));
  await env.KV_USERDATA.delete(followingCacheKey(followerId));
}

export async function unfollow(env: Env, followerId: number, followeeId: number) {
  const repo = new FollowershipRepo(env);
  await repo.deleteByFollowerIdAndFolloweeId(followerId, followeeId);
  await env.KV_USERDATA.delete(followersCacheKey(followeeId));
  await env.KV_USERDATA.delete(followingCacheKey(followerId));
}

export async function getFollowers(env: Env, followeeId: number): Promise<Sensei[]> {
  const cacheKey = followersCacheKey(followeeId);
  const cached = await env.KV_USERDATA.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as Sensei[];
  }

  const followershipRepo = new FollowershipRepo(env); 
  const followerIds = (await followershipRepo.findAllBy("followeeId", followeeId)).map((each) => each.followerId);

  const userRepo = new UserRepo(env);
  const followers = await userRepo.findAllByIn("id", followerIds);
  env.KV_USERDATA.put(cacheKey, JSON.stringify(followers));

  return followers;
}

export async function getFollowing(env: Env, followerId: number): Promise<Sensei[]> {
  const cacheKey = followingCacheKey(followerId);
  const cached = await env.KV_USERDATA.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as Sensei[];
  }

  const followershipRepo = new FollowershipRepo(env);
  const followeeIds = (await followershipRepo.findAllBy("followerId", followerId)).map((each) => each.followeeId);

  const userRepo = new UserRepo(env);
  const followees = await userRepo.findAllByIn("id", followeeIds);
  env.KV_USERDATA.put(cacheKey, JSON.stringify(followees));

  return followees;
}

function followersCacheKey(followeeId: number) {
  return `followerships:followers:${followeeId}`;
}

function followingCacheKey(followerId: number) {
  return `followerships:following:${followerId}`;
}

class FollowershipRepo {
  private db: SupabaseClient<SupabaseSchema>;
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
