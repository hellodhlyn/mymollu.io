import { search } from "hangul-js";
import { Student } from "~/models/student";
import { StudentState } from "~/models/student-state";

export function filterStatesByName(keyword: string, states: StudentState[]): StudentState[] {
  return states.filter((state) => search(state.student.name, keyword) >= 0);
}

export function filterStudentByName(keyword: string, students: Student[]): Student[] {
  return students.filter((student) => search(student.name, keyword) >= 0);
}
