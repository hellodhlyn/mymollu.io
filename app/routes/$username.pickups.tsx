import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { pickupEventsQuery } from "./edit.pickups";
import { EventTypeEnum, PickupEventsQuery } from "~/graphql/graphql";
import { getAuthenticator } from "~/auth/authenticator.server";
import { runQuery } from "~/lib/baql";
import { getPickupHistories } from "~/models/pickup-history";
import { getSenseiByUsername } from "~/models/sensei";
import { useLoaderData } from "@remix-run/react";
import { ErrorPage } from "~/components/organisms/error";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { AddContentButton } from "~/components/molecules/editor";
import { PickupHistoryView } from "~/components/organisms/pickup";
import { SubTitle } from "~/components/atoms/typography";

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""} - 모집 이력 | 몰루로그`.trim() },
    { name: "description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
    { name: "og:title", content: `${params.username || ""} - 편성 | 몰루로그`.trim() },
    { name: "og:description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
  ];
};

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const username = usernameParam.replace("@", "");
  const sensei = await getSenseiByUsername(env, username);
  if (!sensei) {
    throw new Error("Not found");
  }

  const { data, error } = await runQuery<PickupEventsQuery>(pickupEventsQuery, {});
  if (!data) {
    console.error(error);
    throw "failed to load data";
  }

  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  const pickupHistories = (await getPickupHistories(env, sensei.id)).map((history) => ({
    ...history,
    event: data.events.nodes.find((event) => event.eventId === history.eventId)!,
    students: history.result.flatMap((trial) => trial.tier3StudentIds.map((studentId) => data.students.find((student) => student.studentId === studentId)!)),
  }));

  let tier3Count = 0, tier3RateCount = 0;
  let pickupCount = 0, pickupRateCount = 0;
  pickupHistories.forEach((history) => {
    const currentTier3Count = history.result.map((trial) => trial.tier3Count).reduce((a, b) => a + b);

    const pickupStudentIds = history.event.pickups.map((pickup) => pickup.student?.studentId).filter((id) => id !== undefined);
    const currentPickupCount = history.result.flatMap((trial) => trial.tier3StudentIds).filter((studentId) => pickupStudentIds.includes(studentId)).length;

    tier3Count += currentTier3Count;
    pickupCount += currentPickupCount;

    if (history.event.type === EventTypeEnum.Fes) {
      tier3RateCount += currentTier3Count * 0.5;
      pickupRateCount += currentPickupCount * 0.5;
    } else {
      tier3RateCount += currentTier3Count;
      pickupRateCount += currentPickupCount;
    }
  });

  const pickupStatistics = {
    trial: pickupHistories.map((history) => history.result.length * 10).reduce((a, b) => a + b, 0),
    tier3Count,
    tier3RateCount,
    pickupCount,
    pickupRateCount,
  };

  return json({
    me: username === currentUser?.username,
    pickupHistories,
    pickupStatistics,
  });
};

export default function UserPickups() {
  const { pickupHistories, pickupStatistics, me } = useLoaderData<typeof loader>();
  if (pickupHistories.length === 0) {
    return (
      <div className="my-8">
        {me && <AddContentButton text="새로운 모집 이력 추가하기" link="/edit/pickups/new" />}
        <ErrorPage Icon={SparklesIcon} message="아직 모집 이력이 없어요" />
      </div>
    );
  }

  return (
    <div className="my-8">
      <SubTitle text="모집 통계" />
      <div className="p-4 flex grid md:grid-cols-3 border border-neutral-200 rounded-lg">
        <div className="my-4 text-center">
          <p className="text-neutral-500">총 모집 횟수</p>
          <p className="text-2xl font-bold">{pickupStatistics.trial} 번</p>
        </div>
        <div className="my-4 text-center">
          <p className="text-neutral-500">★3 학생 모집 횟수</p>
          <p className="text-2xl font-bold">{pickupStatistics.tier3Count} 번</p>
          <p className="text-sm text-neutral-500">{(pickupStatistics.tier3RateCount / pickupStatistics.trial * 100).toFixed(2)} %</p>
        </div>
        <div className="my-4 text-center">
          <p className="text-neutral-500">픽업 학생 모집 횟수</p>
          <p className="text-2xl font-bold">{pickupStatistics.pickupCount} 번</p>
          <p className="text-sm text-neutral-500">{(pickupStatistics.pickupRateCount / pickupStatistics.trial * 100).toFixed(2)} %</p>
        </div>
      </div>
      <p className="mt-4 mb-16 text-neutral-500 text-sm">
        페스 기간에 모집한 ★3 학생은 확률이 0.5배로 계산됩니다.
      </p>

      <SubTitle text="모집 이력" />
      {me && <AddContentButton text="새로운 모집 이력 추가하기" link="/edit/pickups/new" />}
      {pickupHistories.map(({ uid, event, students }) => {
        const pickupStudentIds = event.pickups.map((pickup) => pickup.student?.studentId).filter((id) => id !== undefined);
        return (
          <PickupHistoryView
            key={uid}
            uid={uid}
            event={{ ...event, since: new Date(event.since) }}
            students={students}
            pickupStudentIds={pickupStudentIds}
          />
        );
      })}
    </div>
  );
}