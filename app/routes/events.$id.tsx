import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import { Link as LinkIcon } from "iconoir-react";
import { SubTitle } from "~/components/atoms/typography";
import { StudentCards } from "~/components/molecules/student";
import { ErrorPage } from "~/components/organisms/error";
import { EventHeader, EventVideos } from "~/components/organisms/event";
import type { Env } from "~/env.server";
import type { PickupEvent } from "~/models/event";
import { getAllEvents, pickupLabel } from "~/models/event";
import type { StudentMap } from "~/models/student";
import { getStudentsMap } from "~/models/student";

type LoaderData = {
  event: PickupEvent;
  pickupStudents: StudentMap;
};

export const loader: LoaderFunction = async ({ params, context }) => {
  const env = context.env as Env;

  const allEvent = await getAllEvents(env);
  let event: PickupEvent | undefined;
  if (!params.id || !(event = allEvent.find(({ id }) => id === params.id)) || !event.hasDetail) {
    throw new Response(
      JSON.stringify({ error: { message: "이벤트 정보를 찾을 수 없어요" } }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const pickupStudents = await getStudentsMap(env, true, event.pickups.map(({ studentId }) => studentId));

  return json<LoaderData>({ event, pickupStudents });
};

export const meta: MetaFunction = ({ data }) => {
  if (!data) {
    return [{ title: "이벤트 정보 | MolluLog" }];
  }

  const { event } = data as LoaderData;
  const title = `${event.name} - 이벤트 정보`;
  const description = `블루 아카이브 "${event.name}" 이벤트의 공략, 픽업 정보 모음`;
  return [
    { title: `${title} | MolluLog` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:image", content: event.image },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};

export const ErrorBoundary = () => {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorPage message={error.data.error.message} />;
  } else {
    return <ErrorPage />;
  }
};

export default function EventDetail() {
  const { event, pickupStudents } = useLoaderData<LoaderData>();

  return (
    <>
      <div className="my-8">
        <EventHeader event={event} />
      </div>

      {pickupStudents && (
        <div className="my-8">
          <SubTitle text="픽업 학생" />
          <StudentCards
            cardProps={event.pickups.map((pickup) => {
              if (pickup.studentId === "-1") {
                return {
                  id: pickup.studentId,
                  label: (<span className={pickup.rerun ? "text-white" : "text-yellow-500"}>{pickupLabel(pickup)}</span>),
                  name: pickup.name,
                };
              } else {
                return {
                  id: pickup.studentId,
                  label: (<span className={pickup.rerun ? "text-white" : "text-yellow-500"}>{pickupLabel(pickup)}</span>),
                  name: pickupStudents[pickup.studentId]!.name,
                };
              }
            })}
            mobileGrid={5}
          />
        </div>
      )}

      {event.tips && (
        <div className="my-8">
          <SubTitle text="공략 및 정보" />
          {event.tips.map((tip) => (
            <div key={`tip-${tip.title}`} className="flex items-center my-2">
              <LinkIcon className="w-5 h-5 mr-1" strokeWidth={2} />
              <a href={tip.link} target="_blank" rel="noopener noreferrer">
                <p>
                  <span className="underline mr-1">{tip.title}</span>
                  <span className="text-xs text-neutral-500">{tip.source}</span>
                </p>
              </a>
            </div>
          ))}
        </div>
      )}

      {(event.videos && event.videos.length > 0) && <EventVideos videos={event.videos} />}
    </>
  );
}
