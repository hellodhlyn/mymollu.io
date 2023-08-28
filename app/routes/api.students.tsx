import { LoaderFunction, json } from "@remix-run/cloudflare";
import { Student } from "~/models/student";
import studentsData from "~/statics/students.json";

function parseAttackType(bulletType: string): Student["attackType"] | null {
  if (bulletType === "Explosion") {
    return "explosive";
  } else if (bulletType === "Pierce") {
    return "piercing";
  } else if (bulletType === "Mystic") {
    return "mystic";
  } else if (bulletType === "Sonic") {
    return "sonic"
  } else {
    return null;
  }
};

export const loader: LoaderFunction = async () => {
  const students = studentsData.filter((row) => row.IsReleased[1]).map((row) => ({
    id: row.Id.toString(),
    name: row.Name,
    imageUrl: `https://schale.gg/images/student/collection/${row.CollectionTexture}.webp`,
    tier: row.StarGrade,
    attackType: parseAttackType(row.BulletType),
  }));

  return json<Student[]>(students, {
    headers: {
      "Cache-Control": "private, max-age=3600",
    },
  });
};
