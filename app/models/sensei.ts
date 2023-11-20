import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupabaseSchema } from "~/schema";
import type { Env} from "~/env.server";
import { getDB } from "~/env.server";

export type Sensei = {
  id: number;
  username: string;
  active: boolean;
  googleId: string | null;
  profileStudentId: string | null;
};

export async function getSenseiById(env: Env, id: number): Promise<Sensei | null> {
  const repo = new UserRepo(env);
  return repo.findBy("id", id);
}

export async function getSenseiByUsername(env: Env, username: string): Promise<Sensei | null> {
  const repo = new UserRepo(env);
  return repo.findBy("username", username);
}

export async function getSenseiByGoogleId(env: Env, googleUserId: string): Promise<Sensei> {
  const repo = new UserRepo(env);
  const sensei = await repo.findBy("googleId", googleUserId);
  if (sensei) {
    return sensei;
  }

  try {
    await repo.create(Math.random().toString(36).slice(2), googleUserId);
  } catch (error) {
    console.error(error);
    throw "Failed to create user";
  }

  return getSenseiByGoogleId(env, googleUserId);
}

export async function updateSensei(env: Env, id: number, values: Partial<Sensei>) {
  try {
    await new UserRepo(env).update(id, values);
  } catch (error) {
    return console.error(error);
  }
}

export class UserRepo {
  private db: SupabaseClient<SupabaseSchema>;
  private tableName: string;

  constructor(env: Env) {
    this.db = getDB(env);
    this.tableName = `${env.STAGE}_users`;
  }

  async create(username: string, googleId: string | null) {
    const { error } = await this.table().insert({ username, googleId });
    if (error) {
      throw error;
    }
  }

  async findBy(field: string, value: any): Promise<Sensei | null> {
    const { data, error } = await this.table().select().eq(field, value);
    if (error) {
      throw error;
    }
    return (data && data.length > 0) ? data[0] : null;
  }

  async findAllByIn(field: string, values: any[]): Promise<Sensei[]> {
    const { data, error } = await this.table().select().in(field, values);
    if (error) {
      throw error;
    }
    return data;
  }

  async update(id: number, values: Partial<Sensei>) {
    const { error } = await this.table().update(values).eq("id", id);
    if (error) {
      throw error;
    }
  }

  private table() {
    return this.db.from(this.tableName);
  }
}
