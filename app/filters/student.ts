import { search } from "hangul-js";
import { Student } from "~/models/student";
import { StudentState } from "~/models/student-state";

export function filterStatesByName(keyword: string, states: StudentState[]): StudentState[] {
  return states.filter((state) => search(state.student.name, keyword) >= 0);
}

export function filterStudentByName<T extends { name: string }>(keyword: string, students: T[]): T[] {
  return students.filter((student) => search(student.name, keyword) >= 0);
}
