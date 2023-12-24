import type { Env } from "~/env.server";
import { fetchStaticData, storeStaticData } from "./statics";

export type School = "abydos" | "gehenna" | "millennium" | "trinity" | "hyakkiyako"
  | "shanhaijing" | "redwinter" | "arius" | "srt" | "valkyrie" | "others";
export type AttackType = "explosive" | "piercing" | "mystic" | "sonic" | null;
export type DefenseType = "light" | "heavy" | "special" | "elastic" |  null;
export type Role = "striker" | "special";
export type Equipment = "badge" | "bag" | "charm" | "glove" | "hairpin" | "hat" | "neckless" | "shoes" | "watch";

export type Student = {
  id: string;
  name: string;
  school: School;
  initialTier: number;
  order: number;
  attackType: AttackType;
  defenseType: DefenseType;
  role: Role;
  equipments: Equipment[];
  released: boolean;
};

export type StudentMap = { [id: string]: Student };

const studentDataKey = "students.json";

export async function storeStudents(env: Env, students: Student[]) {
  await storeStaticData(env, studentDataKey, students);
}

export async function getStudents(env: Env, includeUnreleased: boolean = false): Promise<Student[]> {
  const all = await fetchStaticData<Student[]>(env, studentDataKey) || [];
  if (includeUnreleased) {
    return all;
  } else {
    return all.filter(({ released }) => released);
  }
}

export async function getStudentsMap(env: Env, includeUnreleased: boolean = false, studentIds: string[] = []): Promise<StudentMap> {
  const students = await getStudents(env, includeUnreleased);
  const result: StudentMap = {};
  for (const student of students) {
    if (studentIds.length === 0 || studentIds.includes(student.id)) {
      result[student.id] = student;
    }
  }
  return result;
}

export function studentImageUrl(studentId: string): string {
  return `https://assets.mollulog.net/assets/images/students/${studentId}`;
}
