import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Link, json, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Callout, SubTitle } from "~/components/atoms/typography";
import { ContentHeader } from "~/components/organisms/content";
import { PartyView } from "~/components/organisms/party";
import type { Env } from "~/env.server";
import { graphql } from "~/graphql";
import type { RaidDetailQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { raidTypeLocale } from "~/locales/ko";
import { bossBannerUrl } from "~/models/assets";
import { getPartiesByRaidId } from "~/models/party";
import type { StudentState} from "~/models/student-state";
import { getUserStudentStates } from "~/models/student-state";

const raidDetailQuery = graphql(`
  query RaidDetail($raidId: String!, $studentIds: [String!]) {
    raid(raidId: $raidId) {
      raidId
      type
      name
      boss
      since
      until
      terrain
      attackType
      defenseType
    }
    students(studentIds: $studentIds) {
      studentId
      name
      initialTier
    }
  }
`);

export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
  const raidId = params.id;
  if (!raidId) {
    throw new Response(
      JSON.stringify({ error: { message: "이벤트 정보를 찾을 수 없어요" } }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const env = context.env as Env;
  const parties = await getPartiesByRaidId(env, raidId, true);
  const studentIds = parties.flatMap((party) => party.studentIds.flatMap((squad) => squad));

  const { data, error } = await runQuery<RaidDetailQuery>(raidDetailQuery, { raidId, studentIds });
  let errorMessage: string | null = null;
  if (error || !data) {
    errorMessage = error?.message ?? "이벤트 정보를 가져오는 중 오류가 발생했어요";
  } else if (!data.raid) {
    errorMessage = "이벤트 정보를 찾을 수 없어요";
  }

  if (errorMessage) {
    throw new Response(
      JSON.stringify({ error: { message: errorMessage } }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const sensei = await getAuthenticator(env).isAuthenticated(request);
  let studentStates: StudentState[] = [];
  if (sensei) {
    studentStates = await getUserStudentStates(env, sensei.username, true) ?? [];
  }

  return json({
    raid: data!.raid!,
    parties,
    students: data!.students!,
    studentStates,
    signedIn: sensei !== null,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: "이벤트 정보 | MolluLog" }];
  }

  const { raid } = data;
  const title = `${raidTypeLocale[raid.type]} ${raid.name} 정보`;
  const description = `블루 아카이브 ${raidTypeLocale[raid.type]} ${raid.name} 이벤트의 공략 정보 모음`;
  return [
    { title: `${title} | MolluLog` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

export default function RaidDetail() {
  const { raid, parties, students, studentStates, signedIn } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="my-8">
        <ContentHeader
          name={raid.name}
          type={raidTypeLocale[raid.type]}
          since={dayjs(raid.since)}
          until={dayjs(raid.until)}
          image={bossBannerUrl(raid.boss)}
          videos={null}
        />
      </div>

      <div className="my-8">
        <SubTitle text="공략 및 편성" />
        {!signedIn && (
          <Callout className="my-4" emoji="✨">
            <span>
              <Link to="/signin" className="underline">로그인</Link> 후 학생 모집 정보를 등록하면 내 학생에 맞는 편성을 확인할 수 있어요.
            </span>
          </Callout>
        )}

        {(parties.length === 0) && <p className="my-8 text-center">공략 정보를 준비중이에요.</p>}
        {parties.map((party) => (
          <PartyView party={party} sensei={party.sensei} students={students} studentStates={studentStates} />
        ))}
      </div>
    </>
  );
}
