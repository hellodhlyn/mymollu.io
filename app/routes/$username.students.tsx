import { LoaderFunction, V2_MetaFunction, json } from "@remix-run/cloudflare";
import { useLoaderData, useRouteError } from "@remix-run/react";
import { V2_ErrorBoundaryComponent } from "@remix-run/react/dist/routeModules";
import { StudentState, getUserStudentStates } from "~/models/studentState";
import { Env } from "~/env.server";
import { useStateFilter } from "~/components/organisms/student";
import { StudentCards } from "~/components/molecules/student";

type LoaderData = {
  username: string;
  states: StudentState[] | null;
}

export const loader: LoaderFunction = async ({ context, params }) => {
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");
  let states = await getUserStudentStates(context.env as Env, username, false);

  return json<LoaderData>({
    username,
    states,
  });
};

export const meta: V2_MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""}의 학생부 | MolluLog`.trim() },
    { name: "description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
    { name: "og:title", content: `${params.username || ""}의 학생부 | MolluLog`.trim() },
    { name: "og:description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
  ];
};

export const ErrorBoundary: V2_ErrorBoundaryComponent = () => {
  const error = useRouteError() as any;
  console.error(error);
  return <p>{error.toString()}</p>
};

export default function UserPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { states } = loaderData;
  if (!states) {
    return (
      <p className="my-8">선생님을 찾을 수 없어요. 다른 이름으로 검색해보세요.</p>
    );
  }

  const [StateFilter, filteredStates] = useStateFilter(states);
  return (
    <>
      {StateFilter}

      <div className="my-8">
        <p className="font-bold text-xl my-4">모집한 학생</p>
        <StudentCards
          cardProps={filteredStates.filter(({ owned }) => owned).map(({ student, tier }) => ({
            id: student.id,
            name: student.name,
            imageUrl: student.imageUrl,
            tier: tier ?? student.initialTier,
          }))}
        />
      </div>

      <div className="my-8">
        <p className="font-bold text-xl my-4">미모집 학생</p>
        <StudentCards
          cardProps={filteredStates.filter(({ owned }) => !owned).map(({ student }) => ({
            id: student.id,
            name: student.name,
            imageUrl: student.imageUrl,
            grayscale: true,
          }))}
        />
      </div>
    </>
  );
};
