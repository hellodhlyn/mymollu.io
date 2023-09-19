import { Env } from "~/env.server";

export type Sensei = {
  id: number;
  username: string;
  active: boolean;
  googleId?: string;
  profileStudentId?: string;
};

export async function getSenseiByGoogleId(db: D1Database, googleUserId: string): Promise<Sensei> {
  const result = await db.prepare("select * from users where googleId = ?")
    .bind(googleUserId)
    .first<Sensei>();
  if (result) {
    return result;
  }

  const { error } = await db.prepare("insert into users (username, active, googleId) values (?1, ?2, ?3)")
    .bind(Math.random().toString(36).slice(2), 0, googleUserId)
    .run();
  if (error) {
    console.error(error);
    throw "Failed to create user";
  }

  return getSenseiByGoogleId(db, googleUserId);
}

export async function updateSensei(env: Env, id: number, values: Partial<Sensei>) {
  const { error } = await env.DB.prepare("update users set active = ?1, username = ?2, profileStudentId = ?3 where id = ?4")
    .bind(1, values.username, values.profileStudentId?? null, id)
    .run();
  if (error) {
    return console.error(error);
  }
}
