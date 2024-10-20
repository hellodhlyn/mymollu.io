import { defer } from "@remix-run/cloudflare";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Await, Link, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { Suspense } from "react";
import { SubTitle } from "~/components/atoms/typography";
import { ContentTimelineItem } from "~/components/molecules/content";
import { contentOrders } from "~/components/organisms/content/ContentTimeline";
import { SenseiFinder } from "~/components/organisms/home";
import { Timeline, TimelinePlaceholder } from "~/components/organisms/useractivity";
import type { Env } from "~/env.server";
import { graphql } from "~/graphql";
import type { IndexQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getUserActivities } from "~/models/user-activity";

const indexQuery = graphql(`
  query Index($now: ISO8601DateTime!) {
    students { studentId name }
    contents(untilAfter: $now, sinceBefore: $now, first: 9999) {
      nodes {
        __typename
        name
        since
        until
        ... on Event {
          contentId: eventId
          eventType : type
          rerun
          pickups {
            type
            rerun
            student { studentId }
            studentName
          }
        }
        ... on Raid {
          contentId: raidId
          raidType: type
          boss terrain attackType defenseType
        }
      }
    }
  }
`);

export const meta: MetaFunction = () => {
  return [
    { title: "몰루로그" },
    { name: "description", content: "블루 아카이브 이벤트/컨텐츠 미래시 정보 모음" },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.env as Env;

  const { data, error } = await runQuery<IndexQuery>(indexQuery, { now: new Date().toISOString() });
  if (error || !data) {
    throw error ?? "failed to fetch events";
  }

  return defer({
    students: data.students,
    contents: data.contents.nodes,
    userActivities: getUserActivities(env),
  });
}

export default function Index() {
  const { students, contents, userActivities } = useLoaderData<typeof loader>();
  const today = dayjs();
  return (
    <>
      <div className="p-4 md:px-6 md:py-4 border border-neutral-100 rounded-xl">
        <div className="my-2 flex items-center">
          <div className="w-3 h-3 bg-red-600 border border-1 border-white rounded-full animate-pulse" />
          <p className="ml-2 text-red-600 font-bold">진행중 이벤트</p>
        </div>

        {contents.sort((a, b) => {
          const aContentType = a.__typename === "Event" ? a.eventType : a.raidType;
          const bContentType = b.__typename === "Event" ? b.eventType : b.raidType;
          return contentOrders.indexOf(aContentType) - contentOrders.indexOf(bContentType);
        }).map((content) => {
          const isEvent = content.__typename === "Event";
          const showLink = !isEvent || ["event", "immortal_event", "main_story"].includes(content.eventType);
          return (
            <ContentTimelineItem
              key={content.contentId}
              name={content.name}
              contentType={isEvent ? content.eventType : content.raidType}
              rerun={isEvent ? content.rerun : false}
              remainingDays={dayjs(content.until).diff(today, "day")}
              link={showLink ? `/${isEvent ? "events" : "raids"}/${content.contentId}` : null}
              showMemo={false}
              pickups={isEvent ? content.pickups : undefined}
              raidInfo={isEvent ? undefined : content}
            />
          )
        })}
      </div>
      <Link to="/futures" className="hover:underline hover:opacity-75">
        <p className="mx-2 my-4 mb-8 text-right">미래시 보러가기 →</p>
      </Link>

      <div className="my-8">
        <SubTitle text="선생님 찾기" />
        <SenseiFinder students={students} />
      </div>

      <SubTitle text="타임라인" />
      <Suspense fallback={<TimelinePlaceholder />}>
        <Await resolve={userActivities}>
          {(userActivities) => (
            <Timeline activities={userActivities.map((activity) => ({ ...activity, eventAt: new Date(activity.eventAt) }))} showProfile />
          )}
        </Await>
      </Suspense>
    </>
  );
}
