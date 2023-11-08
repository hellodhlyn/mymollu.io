import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Title } from "~/components/atoms/typography";
import { FutureTimeline, ResourceCalculator } from "~/components/organisms/event";
import type { Env } from "~/env.server";
import type { PickupEvent} from "~/models/event";
import { getFutureEvents } from "~/models/event";
import type { FuturePlan } from "~/models/future";
import { getFuturePlan, setFuturePlan } from "~/models/future";
import type { Student } from "~/models/student";
import { getAllStudents } from "~/models/student";
import type { StudentResource } from "~/models/student-resource";
import { getStudentResource } from "~/models/student-resource";
import type { RaidEvent } from "~/models/raid";
import { getAllTotalAssaults } from "~/models/raid";
import { getAuthenticator } from "~/auth/authenticator.server";

export const meta: MetaFunction = () => {
  return [
    { title: "미래시 | MolluLog" },
    { name: "description", content: "블루 아카이브 한국 서버의 이벤트 및 픽업 일정을 확인하고 계획해보세요." },
  ];
};

type LoaderData = {
  signedIn: boolean;
  events: PickupEvent[];
  totalAssaults: RaidEvent[];
  allStudents: Student[];
  futurePlan: FuturePlan | null;
  resources: StudentResource[];
};

export const loader: LoaderFunction = async ({ context, request }) => {
  const env = context.env as Env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);

  const events = getFutureEvents();
  const eventStudentIds = events.flatMap(({ pickups }) => (
    pickups.map((student) => student.studentId)
  ));

  const signedIn = currentUser !== null;
  const futurePlan = signedIn ? await getFuturePlan(env, currentUser.id) : null;
  return json<LoaderData>({
    signedIn,
    events: getFutureEvents(),
    totalAssaults: getAllTotalAssaults(),
    allStudents: getAllStudents(true).filter(({ id }) => eventStudentIds.includes(id)),
    futurePlan,
    resources: futurePlan?.studentIds?.map((id) => getStudentResource(id)!) ?? [],
  });
};

type ActionData = {
  resources: StudentResource[];
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

  const resources = studentIds.map((id) => getStudentResource(id)!);
  return json<ActionData>({ resources });
};

export default function Futures() {
  const loaderData = useLoaderData<LoaderData>();
  const { signedIn, events, totalAssaults, allStudents } = loaderData;
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

  const [resources, setResources] = useState<StudentResource[]>(loaderData.resources);
  useEffect(() => {
    if (fetcher.state === "loading" && fetcher.data) {
      const fetchedData = fetcher.data as ActionData;
      setResources(fetchedData.resources);
    }
  }, [fetcher]);


  const selectedPickups = events.flatMap((event) => event.pickups)
    .filter((pickup) => plan.studentIds.includes(pickup.studentId));

  return (
    <div className="pb-64">
      <Title text="미래시" />

      <FutureTimeline
        events={events}
        totalAssaults={totalAssaults}
        allStudents={allStudents}
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
            pickups={selectedPickups.map((pickup) => ({
              ...pickup,
              student: allStudents.find(({ id }) => id === pickup.studentId)!,
            }))}
            resources={resources}
            loading={fetcher.state === "submitting"}
          />
        </div>
      )}
    </div>
  );
}
