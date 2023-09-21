import { Env } from "~/env.server";
import { Student, getAllStudents } from "./student";
import { Sensei, getSenseiByUsername } from "./sensei";

export type StudentState = {
  student: Student;
  owned: boolean;
  tier?: number | null;
};

export function userStateKey(username: string) {
  return `student-states:${username}`;
}

export function userStateKeyById(id: number) {
  return `student-states:id:${id}`;
}

export async function getUserStudentStates(env: Env, username: string, showDefault: boolean = false): Promise<StudentState[] | null> {
  const sensei = await getSenseiByUsername(env, username);
  const rawStates = await env.KV_USERDATA.get(sensei ? userStateKeyById(sensei.id) : userStateKey(username));
  if (!rawStates && !showDefault) {
    return null;
  }

  const allStudents = getAllStudents();
  const states = (rawStates ? JSON.parse(rawStates) : []) as StudentState[];
  return allStudents.map((student) => {
    const state = states.find((state) => state.student.id === student.id);
    if (state) {
      return { ...state, student };
    } else {
      return { student, owned: false, tier: student.initialTier };
    }
  });
}

export async function updateStudentStates(env: Env, sensei: Sensei, states: StudentState[]) {
  await env.KV_USERDATA.put(userStateKeyById(sensei.id), JSON.stringify(states));
}

export async function migrateStates(env: Env, username: string, id: number) {
  const states = await env.KV_USERDATA.get(userStateKey(username));
  if (states && !(await env.KV_USERDATA.get(userStateKeyById(id)))) {
    await env.KV_USERDATA.put(userStateKeyById(id), states);
    // TODO: active when code become stable
    // await env.KV_USERDATA.delete(userStateKey(username));
  }
}
