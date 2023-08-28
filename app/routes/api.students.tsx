import { LoaderFunction, json } from "@remix-run/cloudflare";
import { Student } from "~/models/student";
import studentsData from "~/statics/students.json";

export const loader: LoaderFunction = async () => {
  const students = studentsData.filter((row) => row.IsReleased[1]).map((row) => ({
    id: row.Id.toString(),
    name: row.Name,
    imageUrl: `https://schale.gg/images/student/collection/${row.CollectionTexture}.webp`,
    tier: row.StarGrade,
  }));

  return json<Student[]>(students, {
    headers: {
      "Cache-Control": "private, max-age=3600",
    },
  });
};
