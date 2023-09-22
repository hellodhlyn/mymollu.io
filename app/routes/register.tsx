import { ActionFunction, LoaderFunction, V2_MetaFunction, json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { disassemble } from "hangul-js";
import { Authenticator } from "remix-auth";
import { Button, Input } from "~/components/atoms/form";
import { Title } from "~/components/atoms/typography";
import { Sensei, updateSensei } from "~/models/sensei";
import { Student, getAllStudents } from "~/models/student";
import { StudentCards } from "~/components/molecules/student";
import { Env } from "~/env.server";
import { migrateStates } from "~/models/studentState";
import { sessionStorage } from "~/auth/authenticator.server";
import { migrateParties } from "~/models/party";

export const meta: V2_MetaFunction = () => [
  { title: "학생 편성 관리 | MolluLog" },
];

type LoaderData = {
  allStudents: Student[];
};

export const loader: LoaderFunction = async ({ request, context }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  } else if (sensei.active) {
    return redirect(`/@${sensei.username}`);
  }

  return json<LoaderData>({ allStudents: getAllStudents() });
}

export const action: ActionFunction = async ({ request, context }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  } else if (sensei.active) {
    return redirect(`/@${sensei.username}`);
  }

  const formData = await request.formData();
  sensei.active = true;
  sensei.username = formData.get("username") as string;
  sensei.profileStudentId = formData.has("profileStudentId") ? formData.get("profileStudentId") as string : null;

  const env = context.env as Env;
  await Promise.all([
    updateSensei(env, sensei.id, sensei),
    migrateStates(env, sensei.username, sensei.id),
    migrateParties(env, sensei.username, sensei.id),
  ]);

  const { getSession, commitSession } = sessionStorage(env);
  const session = await getSession(request.headers.get("cookie"));
  session.set(authenticator.sessionKey, sensei);
  return redirect(`/@${sensei.username}`, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function Register() {
  const { allStudents } = useLoaderData<LoaderData>();

  const [searchedStudents, setSearchedStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const onSearch = (search: string) => {
    if (search.length === 0) {
      return setSearchedStudents([]);
    }

    const disassembledSearch = disassemble(search).join();
    if (disassembledSearch.length <= 1) {
      return setSearchedStudents([]);
    }

    setSearchedStudents(allStudents.filter((student) => (
      disassemble(student.name).join().includes(disassembledSearch)
    )).slice(0, 6));
  };

  return (
    <>
      <Title text="기본 정보 설정" />
      <Form method="post">
        <Input
          label="프로필 아이콘"
          placeholder="이름으로 찾기..."
          description="학생을 프로필 아이콘으로 선택할 수 있어요."
          onChange={onSearch}
        />
        {(searchedStudents && searchedStudents.length > 0) && (
          <StudentCards
            cardProps={searchedStudents}
            onSelect={(id) => {
              setSelectedStudent(allStudents.find((student) => student.id === id)!);
              setSearchedStudents([]);
            }}
          />
        )}
        {selectedStudent && (
          <>
            <div className="my-8 flex items-center px-4 py-2 bg-neutral-100 rounded-lg">
              <img
                className="h-12 w-12 mr-4 rounded-full"
                src={selectedStudent.imageUrl} alt={selectedStudent.name}
              />
              <p><span className="font-bold">{selectedStudent.name}</span>를 선택했어요.</p>
            </div>
            <input type="hidden" name="profileStudentId" value={selectedStudent.id} />
          </>
        )}

        <Input name="username" label="닉네임" description="기존 임시 로그인에 사용한 아이디와 동일하게 입력해주세요."/>
        <Button type="submit" text="완료" color="primary" className="my-4" />
      </Form>
    </>
  );
}
