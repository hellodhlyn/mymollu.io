import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import dayjs from "dayjs";
import { SubTitle } from "~/components/atoms/typography";
import { StudentCards } from "~/components/molecules/student";
import { ContentHeader } from "~/components/organisms/content";
import { ErrorPage } from "~/components/organisms/error";
import { EventVideos } from "~/components/organisms/event";
import { graphql } from "~/graphql";
import { EventDetailQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { eventTypeLocale, pickupLabelLocale } from "~/locales/ko";

const eventDetailQuery = graphql(`
  query EventDetail($eventId: String!) {
    event(eventId: $eventId) {
      name
      type
      since
      until
      imageUrl
      videos {
        title
        youtube
        start
      }
      pickups {
        type
        rerun
        student { studentId name }
      }
    }
  }
`);

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const { data, error } = await runQuery<EventDetailQuery>(eventDetailQuery, { eventId: params.id });
  let errorMessage: string | null = null;
  if (error || !data) {
    errorMessage = error?.message ?? "이벤트 정보를 가져오는 중 오류가 발생했어요";
  } else if (!data.event) {
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

  return json({ event: data!.event! });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: "이벤트 정보 | MolluLog" }];
  }

  const { event } = data;
  const title = `${event.name} - 이벤트 정보`;
  const description = `블루 아카이브 "${event.name}" 이벤트의 공략, 픽업 정보 모음`;
  return [
    { title: `${title} | MolluLog` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:image", content: event.imageUrl },
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
  const { event } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="my-8">
        <ContentHeader
          name={event.name}
          type={eventTypeLocale[event.type]}
          since={dayjs(event.since)}
          until={dayjs(event.until)}
          image={event.imageUrl}
          videos={event.videos}
        />
      </div>

      {event.pickups.length > 0 && (
        <div className="my-8">
          <SubTitle text="픽업 학생" />
          <StudentCards
            cardProps={event.pickups.map((pickup) => {
              return {
                  id: pickup.student.studentId,
                  name: pickup.student.name,
                  label: (<span className={pickup.rerun ? "text-white" : "text-yellow-500"}>{pickupLabelLocale(pickup)}</span>),
                };
              }
            )}
            mobileGrid={5}
          />
        </div>
      )}

      {(event.videos && event.videos.length > 0) && <EventVideos videos={event.videos} />}
    </>
  );
}
