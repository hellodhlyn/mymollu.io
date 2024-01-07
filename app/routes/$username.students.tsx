import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import type { StudentState } from "~/models/student-state";
import { getUserStudentStates } from "~/models/student-state";
import type { Env } from "~/env.server";
import { useStateFilter } from "~/components/organisms/student";
import { StudentCards } from "~/components/molecules/student";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Callout } from "~/components/atoms/typography";

type LoaderData = {
  currentUsername?: string;
  username: string;
  states: StudentState[] | null;
}

export const loader: LoaderFunction = async ({ context, request, params }) => {
  const env = context.env as Env;
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const currentUser = await getAuthenticator(env).isAuthenticated(request);

  const username = usernameParam.replace("@", "");
  let states = await getUserStudentStates(env, username, false);

  return json<LoaderData>({
    currentUsername: currentUser?.username,
    username,
    states,
  });
};

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""} - 학생부 | MolluLog`.trim() },
    { name: "description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
    { name: "og:title", content: `${params.username || ""} - 학생부 | MolluLog`.trim() },
    { name: "og:description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
  ];
};

export default function UserPage() {
  const loaderData = useLoaderData<LoaderData>();
  const { currentUsername, username, states } = loaderData;
  if (!states) {
    return (
      <p className="my-8">선생님을 찾을 수 없어요. 다른 이름으로 검색해보세요.</p>
    );
  }

  const noOwned = states.every(({ owned }) => !owned);
  const isNewbee = (currentUsername === username) && noOwned;

  const [StateFilter, filteredStates] = useStateFilter(states);
  return (
    <>
      {isNewbee && (
        <Callout className="my-8 flex">
          <span className="grow">✨ 모집한 학생을 등록해보세요.</span>
          <Link to="/edit/students" className="ml-1 underline">등록하러 가기 →</Link>
        </Callout>
      )}

      {StateFilter}

      <div className="my-8">
        <p className="font-bold text-xl my-4">모집한 학생</p>
        {noOwned ?
          <div className="my-16 text-center">
            아직 등록한 학생이 없어요
          </div> :
          <StudentCards
            cardProps={filteredStates.filter(({ owned }) => owned).map(({ student, tier }) => ({
              id: student.id,
              name: student.name,
              tier: tier ?? student.initialTier,
            }))}
          />
        }
      </div>

      <div className="my-8">
        <p className="font-bold text-xl my-4">미모집 학생</p>
        <StudentCards
          cardProps={filteredStates.filter(({ owned }) => !owned).map(({ student }) => ({
            id: student.id,
            name: student.name,
            grayscale: true,
          }))}
        />
      </div>
    </>
  );
}
