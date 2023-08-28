import { Party } from "~/models/party";
import { Student } from "~/models/student";
import { StudentState } from "~/models/studentState";

export async function fetchAllStudents(): Promise<Student[]> {
  const response = await fetch("/api/students");
  return await response.json();
}

export async function fetchStudentStates(username: string): Promise<StudentState[]> {
  const response = await fetch(`/api/student-states?username=${username}`);
  const data = await response.json<{ states: StudentState[] }>();
  return data.states;
}

export async function fetchParties(username: string): Promise<Party[]> {
  const response = await fetch(`/api/parties?username=${username}`);
  const data = await response.json<{ parties: Party[] }>();
  return data.parties;
}
