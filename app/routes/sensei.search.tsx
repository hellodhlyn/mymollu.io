import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { defer } from "@remix-run/cloudflare";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { SubTitle, Title } from "~/components/atoms/typography";
import { SenseiFinder } from "~/components/organisms/home";
import { SenseiList } from "~/components/organisms/sensei";
import { TimelinePlaceholder } from "~/components/organisms/useractivity";
import type { Env } from "~/env.server";
import { graphql } from "~/graphql";
import type { SearchSenseiQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getSenseiById } from "~/models/sensei";
import { filterSenseisByStudent } from "~/models/student-state";

const searchSenseiQuery = graphql(`
  query SearchSensei {
    students { studentId name }
  }
`);

export const meta: MetaFunction = () => [
  { title: "선생님 찾기 | 몰루로그" },
  { description: "학생의 성장 정도를 통해 선생님을 찾아보세요." },
];

type SenseiResponse = {
  username: string;
  profileStudentId: string | null;
  friendCode: string | null;
  filtered: {
    studentId: string;
    studentTier: number;
    studentMinTier: number;
  };
};

async function filterByStudentId(env: Env, studentId: string, minTier: number): Promise<SenseiResponse[]> {
  const senseis = await filterSenseisByStudent(env, studentId, minTier);
  const result: SenseiResponse[] = [];
  for (const { senseiId, tier } of senseis) {
    const sensei = await getSenseiById(env, senseiId);
    if (sensei) {
      result.push({
        username: sensei.username,
        profileStudentId: sensei.profileStudentId,
        friendCode: sensei.friendCode,
        filtered: { studentId, studentTier: tier, studentMinTier: minTier },
      });
    }
  }
  return result;
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { data } = await runQuery<SearchSenseiQuery>(searchSenseiQuery, {});
  if (!data) {
    throw new Error("failed to load students");
  }

  const searchParams = new URL(request.url).searchParams;
  const studentId = searchParams.get("studentId");
  const minTier = searchParams.get("minTier");

  const env = context.cloudflare.env;
  const senseis = studentId ? filterByStudentId(env, studentId, minTier ? parseInt(minTier) : 1) : Promise.resolve(null);
  return defer({
    students: data.students,
    senseis,
  });
};

export default function SenseiSearch() {
  const { students, senseis } = useLoaderData<typeof loader>();

  return (
    <>
      <Title text="선생님 찾기" />

      <SenseiFinder students={students} />

      <div className="h-8" />
      <Suspense fallback={<TimelinePlaceholder />}>
        <Await resolve={senseis}>
          {(senseis) => {
            if (senseis === null) {
              return (
                <div className="my-16 text-center">
                  <p>검색 조건을 선택해주세요.</p>
                </div>
              )
            } else if (senseis.length === 0) {
              return (
                <>
                  <SubTitle text="검색 결과" />
                  <div className="my-16 text-center">
                    <p>검색 조건을 만족하는 선생님이 없어요.</p>
                  </div>
                </>
              );
            }

            const studentName = students.find((student) => student.studentId === senseis[0].filtered.studentId)!.name;

            const minTier = senseis[0].filtered.studentMinTier;
            const tierText = minTier <= 5 ? `${minTier}성` : `고유무기 ${minTier - 5}성`;
            return (
              <>
                <SubTitle text="검색 결과" />
                <p>
                  <span className="font-bold">{studentName}</span> 학생을 <span className="font-bold">{tierText}</span> 이상 성장시킨 선생님 검색 결과입니다.
                </p>
                <SenseiList senseis={senseis} />
              </>
            )
          }}
        </Await>
      </Suspense>
    </>
  );
}
