import studentsData from "~/statics/students.json";

type School = "abydos" | "gehenna" | "millennium" | "trinity" | "hyakkiyako"
  | "shanhaijing" | "redwinter" | "arius" | "srt" | "valkyrie" | "others";

export type Student = {
  id: string;
  name: string;
  school: School;
  imageUrl: string;
  initialTier: number;
  order: number;
  attackType: "explosive" | "piercing" | "mystic" | "sonic" | null;
  defenseType: "light" | "heavy" | "elastic" | null;
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

function parseDefenseType(defenseType: string): Student["defenseType"] | null {
  if (defenseType === "LightArmor") {
    return "light";
  } else if (defenseType === "HeavyArmor") {
    return "heavy";
  } else if (defenseType === "ElasticArmor") {
    return "elastic";
  } else {
    return null;
  }
}

function parseRole(role: string): Student["role"] {
  if (role === "Main") {
    return "striker";
  }
  return "special";
}

export function getAllStudents(unreleased: boolean = false): Student[] {
  return studentsData.filter((row) => unreleased || row.IsReleased[1]).map((row) => ({
    id: row.Id.toString(),
    name: row.Name,
    school: row.School.toLowerCase().replace("etc", "others") as School,
    imageUrl: `/assets/images/students/${row.Id}`,
    initialTier: row.StarGrade,
    order: row.DefaultOrder,
    attackType: parseAttackType(row.BulletType),
    defenseType: parseDefenseType(row.ArmorType),
    role: parseRole(row.SquadType),
  }));
}
