import { redirect, defer } from "@remix-run/cloudflare";
import type { ActionFunction, MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Await, Form, Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { Button, Input } from "~/components/atoms/form";
import { SubTitle } from "~/components/atoms/typography";
import { TimelineItem } from "~/components/organisms/content-timeline";
import { Timeline, TimelinePlaceholder } from "~/components/organisms/useractivity";
import type { Env } from "~/env.server";
import { graphql } from "~/graphql";
import type { IndexQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getUserActivities } from "~/models/user-activity";

const indexQuery = graphql(`
  query Index($now: ISO8601DateTime!) {
    contents(untilAfter: $now, sinceBefore: $now, first: 9999) {
      nodes {
        __typename
        name
        since
        until
        ... on Event {
          eventId
          eventType : type
          rerun
          pickups {
            type
            rerun
            student { studentId name }
          }
        }
        ... on Raid {
          raidId
          raidType: type
          boss
          terrain
          attackType
          defenseType
        }
      }
    }
  }
`);

export const meta: MetaFunction = () => {
  return [
    { title: "MolluLog" },
    { name: "description", content: "블루 아카이브 학생 목록과 성장 상태를 공유해보세요." },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.env as Env;

  const { data, error } = await runQuery<IndexQuery>(indexQuery, { now: new Date().toISOString() });
  if (error || !data) {
    throw error ?? "failed to fetch events";
  }

  return defer({
    userActivities: getUserActivities(env),
    contents: data.contents.nodes,
  });
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  return redirect(`/@${username.replace("@", "")}`);
};

type Event = Extract<IndexQuery["contents"]["nodes"][number], { __typename: "Event" }>;
type Raid = Extract<IndexQuery["contents"]["nodes"][number], { __typename: "Raid" }>;

export default function Index() {
  const { userActivities, contents } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="p-4 md:px-6 md:py-4 border border-neutral-100 rounded-xl">
        <div className="my-2 flex items-center">
          <div className="w-3 h-3 bg-red-600 border border-1 border-white rounded-full animate-pulse" />
          <p className="ml-2 text-red-600 font-bold">진행중 이벤트</p>
        </div>
        {contents.map((contentData) => {
          const content = {
            ...contentData,
            since: new Date(contentData.since),
            until: new Date(contentData.until),
          } as Event | Raid;
          return (
            <TimelineItem
              key={content.__typename === "Event" ? content.eventId : content.raidId}
              raid={content.__typename === "Raid" ? content : undefined}
              event={content.__typename === "Event" ? content : undefined}
            />
          )
        })}
      </div>
      <Link to="/futures" className="hover:underline hover:opacity-75">
        <p className="mx-2 my-4 mb-8 text-right">미래시 보러가기 →</p>
      </Link>

      <SubTitle text="선생님 찾기" />
      <p className="text-neutral-500">닉네임을 입력해 다른 선생님의 프로필을 확인해보세요</p>
      <Form className="flex" method="post">
        <Input name="username" placeholder="@username" />
        <Button type="submit" text="찾기" color="primary" />
      </Form>

      <SubTitle text="타임라인" />
      <Suspense fallback={<TimelinePlaceholder />}>
        <Await resolve={userActivities}>
          {(userActivities) => <Timeline activities={userActivities} showProfile />}
        </Await>
      </Suspense>
    </>
  );
}
