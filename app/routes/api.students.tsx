import { LoaderFunction, json } from "@remix-run/cloudflare";
import { Student, getAllStudents } from "~/models/student";

export const loader: LoaderFunction = async () => {
  return json<Student[]>(getAllStudents(), {
    headers: {
      "Cache-Control": "private, max-age=3600",
    },
  });
};
