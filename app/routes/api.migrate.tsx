import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { nanoid } from "nanoid/non-secure";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Env, getDB } from "~/env.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const me = await getAuthenticator(env).isAuthenticated(request);
  if (!me || (me.username !== env.SUPERUSER_NAME)) {
    return new Response("unauthorized", { status: 401 });
  }

  // Migrate users from supabase to D1
  const db = getDB(env);
  const { data: users, error } = await db.from(`${env.STAGE}_users`).select();
  if (error) {
    return new Response("failed to fetch users", { status: 500 });
  }

  const userQuery = "insert into senseis (id, uid, username, profileStudentId, googleId, active) values (?1, ?2, ?3, ?4, ?5, ?6)";
  let maxId = 0;
  for (const user of users) {
    maxId = Math.max(maxId, user.id);
    await env.DB.prepare(userQuery).bind(user.id, nanoid(8), user.username, user.profileStudentId, user.googleId, user.active).run();
  }
  await env.DB.exec(`update SQLITE_SEQUENCE set seq = ${maxId} where name = 'senseis'`);


  // Migrate followerships from supabase to D1
  const { data: followerships, error: error2 } = await db.from(`${env.STAGE}_followerships`).select();
  if (error2) {
    return new Response("failed to fetch followerships", { status: 500 });
  }

  const followershipQuery = "insert into followerships (followerId, followeeId) values (?1, ?2)";
  for (const followership of followerships) {
    await env.DB.prepare(followershipQuery).bind(followership.followerId, followership.followeeId).run();
  }


  // Migrate user_activities from supabase to D1
  const { data: userActivities, error: error3 } = await db.from(`${env.STAGE}_user_activities`).select();
  if (error3) {
    return new Response("failed to fetch user_activities", { status: 500 });
  }

  const userActivityQuery = "insert into user_activities (uid, userId, activityType, payload, createdAt, updatedAt) values (?1, ?2, ?3, ?4, ?5, ?6)";
  for (const userActivity of userActivities) {
    await env.DB.prepare(userActivityQuery).bind(
      userActivity.uid, userActivity.userId, userActivity.activityType, JSON.stringify(userActivity.payload),
      userActivity.createdAt, userActivity.createdAt,
    ).run();
  }


  return new Response("ok", { status: 200 });
};
