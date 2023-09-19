import { ActionFunction, LoaderFunction, V2_MetaFunction, json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Authenticator } from "remix-auth";
import { SubTitle } from "~/components/atoms/typography";
import { StudentCards } from "~/components/molecules/student";
import { PartyEditor, useStateFilter } from "~/components/organisms/student";
import { Env } from "~/env.server";
import { addParty } from "~/models/party";
import { Sensei } from "~/models/sensei";
import { StudentState, getUserStudentStates } from "~/models/studentState";

export const meta: V2_MetaFunction = () => [
  { title: "학생 편성 관리 | MolluLog" },
];

type LoaderData = {
  currentUsername: string;
  states: StudentState[];
}

export const loader: LoaderFunction = async ({ context, request }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  let states = await getUserStudentStates(context.env as Env, sensei.username, true);
  return json<LoaderData>({
    currentUsername: sensei.username,
    states: states!,
  });
};

export const action: ActionFunction = async ({ context, request }) => {
  const env = context.env as Env;
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  await addParty(env, sensei, {
    name: formData.get("name") as string,
    studentIds: JSON.parse(formData.get("studentIds") as string),
  });
  return redirect(`/@${sensei.username}/parties`);
};

export default function EditNewParties() {
  const loaderData = useLoaderData<LoaderData>();

  const [StateFilter, filteredStates] = useStateFilter(loaderData.states);
  const [partyStudents, setPartyStudents] = useState<(string | null)[]>(new Array(6).fill(null));

  const [error, setError] = useState<string | null>(null);

  const addPartyStudent = (id: string) => {
    const state = loaderData.states.find((state) => state.student.id === id);
    if (!state) {
      return;
    }

    // 학생은 최대 6명까지 편성 가능하며, 중복 편성 불가능
    if (partyStudents.includes(id)) {
      return setError("학생은 중복해서 편성할 수 없어요.");
    }
    if (partyStudents.filter((each) => each !== null).length >= 6) {
      return setError("학생은 최대 6명까지만 편성할 수 있어요.");
    }

    // 조력자는 1명까지 편성 가능 (총력전 기준)
    if (
      !state.owned &&
      partyStudents.find((each) => loaderData.states.find((state) => state.student.id === each)?.owned === false)
    ) {
      return setError("조력자 학생은 최대 1명까지만 편성할 수 있어요.");
    }

    const { student } = state;
    if (student.role === "striker") {
      // 스트라이커는 최대 4명까지 편성 가능하며 항상 앞의 4자리를 차지
      const emptyIndex = partyStudents.indexOf(null);
      if (emptyIndex >= 4) {
        return setError("스트라이커 학생은 최대 4명까지 편성할 수 있어요.");
      }

      setPartyStudents((prev) => {
        const newPartyStudents = [...prev];
        newPartyStudents[emptyIndex] = student.id;
        return newPartyStudents;
      });
    } else {
      // 스페셜은 최대 2명까지 편성 가능하며 항상 뒤의 2자리를 차지
      if (partyStudents[4] !== null && partyStudents[5] !== null) {
        return setError("스페셜 학생은 최대 2명까지 편성할 수 있어요.");
      }

      setPartyStudents((prev) => {
        const newPartyStudents = [...prev];
        newPartyStudents[prev[4] == null ? 4 : 5] = student.id;
        return newPartyStudents;
      });
    }
  };

  return (
    <div className="pb-64">
      {StateFilter}

      <SubTitle text="모집한 학생" />
      <StudentCards
        cardProps={filteredStates.filter(({ owned }) => owned).map(({ student, tier }) => ({
          id: student.id,
          name: student.name,
          imageUrl: student.imageUrl,
          tier: tier ?? student.initialTier,
        }))}
        onSelect={addPartyStudent}
      />

      <SubTitle text="조력자 학생" />
      <StudentCards
        cardProps={filteredStates.filter(({ owned }) => !owned).map(({ student, tier }) => ({
          id: student.id,
          name: student.name,
          imageUrl: student.imageUrl,
        }))}
        onSelect={addPartyStudent}
      />

      <div className="fixed w-screen bottom-0 left-0">
        <Form method="post">
          <PartyEditor
            states={partyStudents.map((id) => (
              id === null ? null : loaderData.states.find((state) => state.student.id === id)!
            ))}
            errorMessage={error}
            onErrorDisappear={() => setError(null)}
            onReset={() => setPartyStudents(new Array(6).fill(null))}
          />
          <input type="hidden" name="username" value={loaderData.currentUsername} />
          <input type="hidden" name="studentIds" value={JSON.stringify(partyStudents)} />
        </Form>
      </div>
    </div>
  );
}
