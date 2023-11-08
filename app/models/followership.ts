import type { SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "~/env.server";
import { getDB } from "~/env.server";
import type { SupabaseSchema } from "~/schema";
import type { Sensei} from "./sensei";
import { UserRepo } from "./sensei";

export type Followership = SupabaseSchema["public"]["Tables"]["dev_followerships"]["Row"];
export type Relationship = {
  followed: boolean;
  following: boolean;
};

export async function follow(env: Env, followerId: number, followeeId: number) {
  const repo = new FollowershipRepo(env);
  await repo.create(followerId, followeeId);
}

export async function unfollow(env: Env, followerId: number, followeeId: number) {
  const repo = new FollowershipRepo(env);
  await repo.deleteByFollowerIdAndFolloweeId(followerId, followeeId);
}

export async function getFollowers(env: Env, followeeId: number): Promise<Sensei[]> {
  const followershipRepo = new FollowershipRepo(env); 
  const followerIds = (await followershipRepo.findAllBy("followeeId", followeeId)).map((each) => each.followerId);
  if (followerIds.length === 0) {
    return [];
  }

  const userRepo = new UserRepo(env);
  return userRepo.findAllByIn("id", followerIds);
}

export async function getFollowing(env: Env, followerId: number): Promise<Sensei[]> {
  const followershipRepo = new FollowershipRepo(env);
  const followeeIds = (await followershipRepo.findAllBy("followerId", followerId)).map((each) => each.followeeId);
  if (followeeIds.length === 0) {
    return [];
  }

  const userRepo = new UserRepo(env);
  return userRepo.findAllByIn("id", followeeIds);
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
