import { PlusCircleIcon } from "@heroicons/react/16/solid";
import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { getAuthenticator } from "~/auth/authenticator.server";
import { SubTitle, Title } from "~/components/atoms/typography";
import { StudentCards } from "~/components/molecules/student";
import { graphql } from "~/graphql";
import { PickupEventsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { eventTypeLocale } from "~/locales/ko";
import { deletePickupHistory, getPickupHistories } from "~/models/pickup-history";
import { sanitizeClassName } from "~/prophandlers";

export const pickupEventsQuery = graphql(`
  query PickupEvents {
    events(first: 9999) {
      nodes {
        eventId name since until type rerun
        pickups {
          student { studentId }
          studentName
        }
      }
    }
    students {
      initialTier studentId name
    }
  }
`);

export const meta: MetaFunction = () => [
  { title: "모집 이력 관리 | 몰루로그" },
];

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const { data, error } = await runQuery<PickupEventsQuery>(pickupEventsQuery, {});
  if (!data) {
    console.error(error);
    throw "failed to load data";
  }

  const pickupHistories = await getPickupHistories(env, sensei.id);
  return json({
    pickupHistories: pickupHistories.map((history) => ({
      ...history,
      event: data.events.nodes.find((event) => event.eventId === history.eventId)!,
      students: history.result.flatMap((trial) => trial.tier3StudentIds.map((studentId) => data.students.find((student) => student.studentId === studentId)!)),
    })),
  });
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  if (request.method !== "DELETE") {
    return redirect("/edit/pickups");
  }

  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const body = new URLSearchParams(await request.text());
  const uid = body.get("uid")!;
  await deletePickupHistory(env, sensei.id, uid);

  return redirect("/edit/pickups");
};

export default function EditPickups() {
  const { pickupHistories } = useLoaderData<typeof loader>();

  return (
    <>
      <Title text="모집 이력 관리" />
      <div className="max-w-4xl">
        <Link to="/edit/pickups/new">
          <div className={sanitizeClassName(`
            my-4 p-4 flex justify-center items-center border border-neutral-200
            rounded-lg text-neutral-500 hover:bg-neutral-100 transition cursor-pointer
          `)}>
            <PlusCircleIcon className="h-4 w-4 mr-1" />
            <span>새로운 모집 이력 추가하기</span>
          </div>
        </Link>

        {pickupHistories.map(({ uid, event, students }) => {
          const pickupStudentIds = event.pickups.map((pickup) => pickup.student?.studentId);
          return (
            <div key={uid} className="my-4 p-4 md:p-6 rounded-lg bg-neutral-100">
              <SubTitle className="my-0" text={event.name} />
              <p className="text-neutral-500 text-sm">
                {eventTypeLocale[event.type]} | {dayjs(event.since).format("YYYY-MM-DD")}
              </p>
              <p className="mt-4 mb-2 font-bold">모집한 ★3 학생</p>
              <StudentCards
                pcGrid={10}
                students={students.map(({ studentId, name }) => ({
                  studentId,
                  name,
                  label: pickupStudentIds.includes(studentId) ? <span className="text-yellow-500">픽업</span> : undefined,
              }))}
              />
              <div className="flex items-center justify-end">
                <Link to={`/edit/pickups/${uid}`}>
                  <span className="-mr-2 px-4 p-2 hover:bg-neutral-200 text-neutral-500 font-bold transition rounded-lg">
                    편집
                  </span>
                </Link>
                <Form method="delete">
                  <input type="hidden" name="uid" value={uid} />
                  <button className="-mr-2 px-4 p-2 hover:bg-neutral-200 text-red-500 font-bold transition rounded-lg">
                    삭제
                  </button>
                </Form>
              </div>
            </div>
          )
        })}
      </div>
    </>
  );
}
