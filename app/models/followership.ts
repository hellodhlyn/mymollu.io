import type { Env } from "~/env.server";
import type { Sensei } from "./sensei";
import { getSenseisById } from "./sensei";
import { createFollowingActivity } from "./user-activity";
import { deleteCache, fetchCached } from "./base";

export type Followership = {
  followerId: number;
  followeeId: number;
}

export type Relationship = {
  followed: boolean;
  following: boolean;
};

export async function follow(env: Env, followerId: number, followeeId: number) {
  const query = "insert into followerships (followerId, followeeId) values (?1, ?2)";
  await env.DB.prepare(query).bind(followerId, followeeId).run();
  await createFollowingActivity(env, followerId, followeeId);
  await deleteCache(env, followersCacheKey(followeeId), followingCacheKey(followerId));
}

export async function unfollow(env: Env, followerId: number, followeeId: number) {
  const query = "delete from followerships where followerId = ?1 and followeeId = ?2";
  await env.DB.prepare(query).bind(followerId, followeeId).run();
  await deleteCache(env, followersCacheKey(followeeId), followingCacheKey(followerId));
}

export async function getFollowers(env: Env, followeeId: number): Promise<Sensei[]> {
  return fetchCached(env, followersCacheKey(followeeId), async () => {
    const query = "select * from followerships where followeeId = ?1";
    const result = await env.DB.prepare(query).bind(followeeId).all<Followership>();
    const followerIds = result.results.map((each) => each.followerId);

    return getSenseisById(env, [...new Set(followerIds)]);
  });
}

export async function getFollowings(env: Env, followerId: number): Promise<Sensei[]> {
  return fetchCached(env, followingCacheKey(followerId), async () => {
    const query = "select * from followerships where followerId = ?1";
    const result = await env.DB.prepare(query).bind(followerId).all<Followership>();
    const followeeIds = result.results.map((each) => each.followeeId);

    return getSenseisById(env, [...new Set(followeeIds)]);
  });
}

function followersCacheKey(followeeId: number) {
  return `followerships:followers:${followeeId}`;
}

function followingCacheKey(followerId: number) {
  return `followerships:following:${followerId}`;
}
