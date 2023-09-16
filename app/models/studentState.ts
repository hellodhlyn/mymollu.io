import { Env } from "~/env.server";
import { Student, getAllStudents } from "./student";

export type StudentState = {
  student: Student;
  owned: boolean;
  tier?: number | null;
};

export async function getUserStudentStates(env: Env, username: string, showDefault: boolean = false): Promise<StudentState[] | null> {
  const rawStates = await env.KV_USERDATA.get(userStateKey(username));
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

export function userStateKey(username: string) {
  return `student-states:${username}`;
}
