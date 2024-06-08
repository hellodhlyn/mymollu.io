import { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Link, json, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { Link as LinkIcon } from "iconoir-react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { StudentCard } from "~/components/atoms/student";
import { Callout, SubTitle } from "~/components/atoms/typography";
import { ContentHeader } from "~/components/organisms/content";
import { Env } from "~/env.server";
import { graphql } from "~/graphql";
import { RaidDetailQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { raidTypeLocale } from "~/locales/ko";
import { bossBannerUrl } from "~/models/assets";
import { getRaidTipsByRaidId } from "~/models/raid-tip";
import { StudentState, getUserStudentStates } from "~/models/student-state";

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
  const tips = await getRaidTipsByRaidId(env, raidId!);
  const studentIds = tips.flatMap(({ parties }) => parties?.flatMap((party) => party));

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
    studentStates = await getUserStudentStates(env, sensei.username) ?? [];
  }

  return json({ 
    raid: data!.raid!,
    tips,
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
  const { raid, tips, students, studentStates, signedIn } = useLoaderData<typeof loader>();

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
          <Callout className="my-4 flex">
            <span className="grow">
              ✨ <Link to="/signin" className="underline">로그인</Link> 후 학생 모집 정보를 등록하면 내 학생에 맞는 편성을 확인할 수 있어요.
            </span>
          </Callout>
        )}

        {(tips.length === 0) && (
          <p className="my-8 text-center">공략 정보를 준비중이에요.</p>
        )}
        {tips.map(({ title, description, parties, sourceUrl }) => (
          <div id={`tip-${title}`} className="my-8">
            <h3 className="text-lg font-bold">{title}</h3>
            {sourceUrl && (
              <p className="text-sm text-neutral-500">
                <LinkIcon className="w-4 h-4 inline-block mr-1" strokeWidth={2} />
                <a className="underline" href={sourceUrl} target="_blank" rel="noreferrer">
                  {sourceUrl.replace(/^https?:\/\//, "")}
                </a>
              </p>
            )}
            <p className="my-2">{description}</p>
            {parties && (parties.map((party) => (
              <div className="my-2 grid grid-cols-6 md:grid-cols-10 gap-1 md:gap-2">
                {party.map((studentId) => {
                  const student = students.find(({ studentId: id }) => id === studentId)!;
                  const state = studentStates.find(({ student }) => student.id === studentId)!;
                  return (
                    <StudentCard
                      key={`student-${studentId}`}
                      studentId={studentId}
                      name={student.name}
                      tier={(signedIn && state?.owned) ? (state?.tier ?? student.initialTier) : null}
                      grayscale={signedIn && !state?.owned}
                    />
                  );
                })}
              </div>
            )))}
          </div>
        ))}
      </div>
    </>
  );
}
