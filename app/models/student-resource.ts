import studentsData from "~/statics/students.json";

export type Equipment = "badge" | "bag" | "charm" | "glove" | "hairpin" | "hat" | "neckless" | "shoes" | "watch";
export type StudentResource = {
  id: string;
  equipments: Equipment[];
}

export function getStudentResource(studentId: string): StudentResource | null {
  const student = studentsData.find(({ Id }) => studentId === Id.toString());
  if (!student) {
    return null;
  }

  return {
    id: studentId,
    equipments: student.Equipment.map((each) => each.toLowerCase() as Equipment),
  };
}
