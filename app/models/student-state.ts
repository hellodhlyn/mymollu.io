import type { Env } from "~/env.server";
import { getStudentsMap } from "./student";
import type { Student } from "./student";
import type { Sensei } from "./sensei";
import { getSenseiByUsername } from "./sensei";

export type StudentState = {
  student: Student;
  owned: boolean;
  tier?: number | null;
};

export function userStateKeyById(id: number) {
  return `student-states:id:${id}`;
}

export async function getUserStudentStates(env: Env, username: string, includeUnreleased: boolean = false): Promise<StudentState[] | null> {
  const sensei = await getSenseiByUsername(env, username);
  if (!sensei) {
    return null;
  }

  const rawStates = await env.KV_USERDATA.get(userStateKeyById(sensei.id));
  const allStudents = await getStudentsMap(env, includeUnreleased);
  const states = (rawStates ? JSON.parse(rawStates) : []) as StudentState[];
  return Object.entries(allStudents).map(([studentId, student]) => {
    const state = states.find((state) => state.student.id === studentId);
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
