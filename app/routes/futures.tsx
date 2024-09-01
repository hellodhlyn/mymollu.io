import type { ActionFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Callout, Title } from "~/components/atoms/typography";
import { FutureTimeline } from "~/components/templates/future";
import type { Env } from "~/env.server";
import type { FuturePlan } from "~/models/future";
import { getFuturePlan, setFuturePlan } from "~/models/future";
import { getAuthenticator } from "~/auth/authenticator.server";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import type { FutureContentsQuery } from "~/graphql/graphql";

const futureContentsQuery = graphql(`
  query FutureContents($now: ISO8601DateTime!) {
    contents(untilAfter: $now, first: 9999) {
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
            student { studentId attackType defenseType role schaleDbId }
            studentName
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
  const title = "블루 아카이브 이벤트, 픽업 미래시";
  const description = "블루 아카이브 한국 서버의 이벤트 및 총력전, 픽업 미래시 정보 모음";
  return [
    { title: `${title} | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);

  const { data, error } = await runQuery<FutureContentsQuery>(futureContentsQuery, { now: new Date().toISOString() });
  if (error || !data) {
    throw error ?? "failed to fetch events";
  }

  const signedIn = currentUser !== null;
  const futurePlan = signedIn ? await getFuturePlan(env, currentUser.id) : null;
  return json({
    signedIn,
    contents: data.contents.nodes,
    futurePlan,
  });
};

type ActionData = {
};

export const action: ActionFunction = async ({ context, request }) => {
  const env = context.env as Env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  await setFuturePlan(env, currentUser.id, {
    pickups: formData.get("pickups") ? JSON.parse(formData.get("pickups") as string) : undefined,
    memos: formData.get("memos") ? JSON.parse(formData.get("memos") as string) : undefined,
  });

  return json<ActionData>({});
};

type Event = Extract<FutureContentsQuery["contents"]["nodes"][number], { __typename: "Event" }>;
type Raid = Extract<FutureContentsQuery["contents"]["nodes"][number], { __typename: "Raid" }>;

export default function Futures() {
  const { signedIn, contents: contentsData, futurePlan } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const contents = contentsData.map((content) => ({
    ...content,
    since: new Date(content.since),
    until: new Date(content.until),
  } as Event | Raid));

  const [plan, setPlan] = useState<FuturePlan>(futurePlan ?? { studentIds: [] });
  useEffect(() => {
    if (!signedIn) {
      return;
    }

    const timer = setTimeout(() => {
      fetcher.submit(
        {
          pickups: plan.pickups ? JSON.stringify(plan.pickups) : null,
          memos: plan.memos ? JSON.stringify(plan.memos) : null,
        },
        { method: "post", navigate: false },
      );
    }, 500);

    return () => { clearTimeout(timer); };
  }, [plan]);

  const events = (contents.filter((content) => content.__typename === "Event") as Event[]).map((event) => ({
    ...event,
    pickups: event.pickups.map((pickup) => {
      const studentId = pickup.student?.studentId;
      return {
        ...pickup,
        student: {
          ...pickup.student,
          studentId: studentId ?? null,
          name: pickup.studentName,
          state: {
            selected: studentId && plan.pickups?.[event.eventId]?.includes(studentId),
          },
        },
      };
    }),
  }));

  return (
    <div className="pb-64">
      <Title text="미래시" />
      <p className="text-neutral-500 -mt-2 my-4">
        미래시는 일본 서버 일정을 바탕으로 추정된 것으로, 실제 일정과 다를 수 있습니다.
      </p>

      {plan.studentIds && plan.studentIds.length > 0 && !plan.pickups && (
        <Callout className="my-4 flex" emoji="🚚">
          <p>관심 학생을 등록하는 방식이 변경되었어요. 기존에 선택했던 학생을 새로 등록해주세요.</p>
        </Callout>
      )}

      <FutureTimeline
        events={events}
        raids={contents.filter((content) => content.__typename === "Raid") as Raid[]}
        plan={plan}
        onSelectStudent={signedIn ? (eventId, studentId) => {
          if (!studentId) {
            return;
          }

          const newPickups = plan.pickups ? { ...plan.pickups } : {};
          const eventPickups = newPickups[eventId] ?? [];
          newPickups[eventId] = eventPickups.includes(studentId) ? eventPickups.filter((id) => id !== studentId) : [...eventPickups, studentId];

          setPlan((prev) => ({ ...prev, pickups: newPickups }));
        } : () => navigate("/signin")}
        onMemoUpdate={signedIn ?
          (newMemo) => setPlan((prev) => ({ ...prev, memos: { ...prev.memos, ...newMemo } })) :
          undefined
        }
      />
    </div>
  );
}
