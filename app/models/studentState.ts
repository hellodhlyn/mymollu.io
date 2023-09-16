import { Env } from "~/env.server";
import { Student, getAllStudents } from "./student";

export type StudentState = {
  student: Student;
  owned: boolean;
};

export async function getUserStudentStates(env: Env, username: string): Promise<StudentState[]> {
  const rawStates = await env.KV_USERDATA.get(userStateKey(username));
  if (!rawStates) {
    return [];
  }

  const allStudents = getAllStudents();
  const states = JSON.parse(rawStates) as StudentState[];
  return allStudents.map((student) => {
    const state = states.find((state) => state.student.id === student.id);
    if (state) {
      return { ...state, student };
    } else {
      return { student, owned: false };
    }
  });
}

export function userStateKey(username: string) {
  return `student-states:${username}`;
}
