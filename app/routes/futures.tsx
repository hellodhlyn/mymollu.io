import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Title } from "~/components/atoms/typography";
import { FutureTimeline, ResourceCalculator } from "~/components/organisms/event";
import type { Env } from "~/env.server";
import type { GameEvent } from "~/models/event";
import { getFutureEvents } from "~/models/event";
import type { FuturePlan } from "~/models/future";
import { getFuturePlan, setFuturePlan } from "~/models/future";
import type { StudentMap } from "~/models/student";
import { getStudentsMap } from "~/models/student";
import type { RaidEvent } from "~/models/raid";
import { getRaids } from "~/models/raid";
import { getAuthenticator } from "~/auth/authenticator.server";

export const meta: MetaFunction = () => {
  const title = "블루 아카이브 이벤트, 픽업 미래시";
  const description = "블루 아카이브 한국 서버의 이벤트 및 총력전, 픽업 미래시 정보 모음";
  return [
    { title: `${title} | MolluLog` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

type LoaderData = {
  signedIn: boolean;
  events: GameEvent[];
  raids: RaidEvent[];
  students: StudentMap;
  futurePlan: FuturePlan | null;
};

export const loader: LoaderFunction = async ({ context, request }) => {
  const env = context.env as Env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);

  const events = await getFutureEvents(env);
  const eventStudentIds = events.flatMap(({ pickups }) => (
    pickups.map((student) => student.studentId)
  ));
  const students = await getStudentsMap(env, true, eventStudentIds);

  const signedIn = currentUser !== null;
  const futurePlan = signedIn ? await getFuturePlan(env, currentUser.id) : null;
  return json<LoaderData>({
    signedIn,
    events,
    raids: await getRaids(env),
    students,
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
  const studentIds = JSON.parse(formData.get("studentIds") as string) as string[];
  await setFuturePlan(env, currentUser.id, {
    studentIds,
    memos: formData.get("memos") ? JSON.parse(formData.get("memos") as string) : undefined,
  });

  return json<ActionData>({});
};

export default function Futures() {
  const loaderData = useLoaderData<LoaderData>();
  const { signedIn, events, raids, students } = loaderData;
  const fetcher = useFetcher();

  const [plan, setPlan] = useState<FuturePlan>(loaderData.futurePlan ?? { studentIds: [] });
  useEffect(() => {
    if (!signedIn) {
      return;
    }

    const timer = setTimeout(() => {
      fetcher.submit(
        {
          studentIds: JSON.stringify(plan.studentIds),
          memos: plan.memos ? JSON.stringify(plan.memos) : null,
        },
        { method: "post", navigate: false },
      );
    }, 500);

    return () => { clearTimeout(timer); };
  }, [plan]);

  const selectedPickups = events.flatMap((event) => event.pickups)
    .filter((pickup) => plan.studentIds.includes(pickup.studentId));

  return (
    <div className="pb-64">
      <Title text="미래시" />

      <FutureTimeline
        events={events}
        raids={raids}
        students={students}
        plan={plan}
        onSelectStudent={signedIn ? (studentId) => {
          const newSelectedIds = plan.studentIds.includes(studentId) ?
            plan.studentIds.filter((id) => id !== studentId) : [...plan.studentIds, studentId];
          setPlan((prev) => ({ ...prev, studentIds: newSelectedIds }));
        } : undefined}
        onMemoUpdate={signedIn ?
          (newMemo) => setPlan((prev) => ({ ...prev, memos: { ...prev.memos, ...newMemo } })) :
          undefined
        }
      />

      {(plan.studentIds.length > 0) && (
        <div className="fixed w-screen bottom-0 left-0">
          <ResourceCalculator
            pickups={selectedPickups}
            students={students}
            loading={fetcher.state === "submitting"}
          />
        </div>
      )}
    </div>
  );
}
