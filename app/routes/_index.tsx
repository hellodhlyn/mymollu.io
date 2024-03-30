import { redirect, defer } from "@remix-run/cloudflare";
import type { ActionFunction, MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Await, Form, Link, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { Suspense } from "react";
import { Button, Input } from "~/components/atoms/form";
import { SubTitle } from "~/components/atoms/typography";
import { EventTimelineItem, RaidTimelineItem } from "~/components/molecules/event";
import { Timeline, TimelinePlaceholder } from "~/components/organisms/useractivity";
import type { Env } from "~/env.server";
import { getFutureEvents } from "~/models/event";
import { getRaids } from "~/models/raid";
import { getStudentsMap } from "~/models/student";
import { getUserActivities } from "~/models/user-activity";

export const meta: MetaFunction = () => {
  return [
    { title: "MolluLog" },
    { name: "description", content: "블루 아카이브 학생 목록과 성장 상태를 공유해보세요." },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.env as Env;

  const now = dayjs();
  const filterActiveEvent: (({ since, until }: { since: string, until: string }) => boolean) =
    ({ since, until }) => (dayjs(since).isBefore(now) && dayjs(until).isAfter(now));

  const events = (await getFutureEvents(env)).filter(filterActiveEvent);
  const raids = (await getRaids(env)).filter(filterActiveEvent);
  const pickupStudentIds = events.flatMap((event) => event.pickups.map((pickup) => pickup.studentId));
  const students = await getStudentsMap(env, true, pickupStudentIds);

  return defer({
    userActivities: getUserActivities(env),
    events, raids, students,
  });
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  return redirect(`/@${username.replace("@", "")}`);
};

export default function Index() {
  const { userActivities, events, raids, students } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="p-4 md:px-6 md:py-4 border border-neutral-100 rounded-xl">
        <div className="my-2 flex items-center">
          <div className="w-3 h-3 bg-red-600 border border-1 border-white rounded-full animate-pulse" />
          <p className="ml-2 text-red-600 font-bold">진행중 이벤트</p>
        </div>
        {events.map((event) => (
          <EventTimelineItem key={`event-${event.id}`} {...event} students={students} />
        ))}
        {raids.map((raid) => (
          <RaidTimelineItem key={`raid-${raid.id}`} {...raid} />
        ))}
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
