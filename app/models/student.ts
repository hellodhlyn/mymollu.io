import studentsData from "~/statics/students.json";

export type Student = {
  id: string;
  name: string;
  imageUrl: string;
  initialTier: number;
  order: number;
  attackType: "explosive" | "piercing" | "mystic" | "sonic" | null;
  role: "striker" | "special";
};

function parseAttackType(attackType: string): Student["attackType"] | null {
  if (attackType === "Explosion") {
    return "explosive";
  } else if (attackType === "Pierce") {
    return "piercing";
  } else if (attackType === "Mystic") {
    return "mystic";
  } else if (attackType === "Sonic") {
    return "sonic"
  } else {
    return null;
  }
};

function parseRole(role: string): Student["role"] {
  if (role === "Main") {
    return "striker";
  }
  return "special";
}

export function getAllStudents(): Student[] {
  return studentsData.filter((row) => row.IsReleased[1]).map((row) => ({
    id: row.Id.toString(),
    name: row.Name,
    imageUrl: `/assets/images/students/${row.Id}`,
    initialTier: row.StarGrade,
    order: row.DefaultOrder,
    attackType: parseAttackType(row.BulletType),
    role: parseRole(row.SquadType),
  }));
}
