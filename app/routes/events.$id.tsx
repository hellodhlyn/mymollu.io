import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import dayjs from "dayjs";
import { Link as LinkIcon } from "iconoir-react";
import { useState } from "react";
import { SubTitle } from "~/components/atoms/typography";
import { StudentCards } from "~/components/molecules/student";
import { ErrorPage } from "~/components/organisms/error";
import type { PickupEvent } from "~/models/event";
import { eventLabelsMap, getAllEvents } from "~/models/event";
import type { Student } from "~/models/student";
import { getAllStudents } from "~/models/student";
import { sanitizeClassName } from "~/prophandlers";

type LoaderData = {
  event: PickupEvent;
  pickupStudents: Student[];
};

export const loader: LoaderFunction = ({ params }) => {
  const allEvent = getAllEvents();
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

  const allStudents = getAllStudents(true);
  const pickupStudents = event.pickups.map(({ studentId }) => allStudents.find(({ id }) => id === studentId)!);

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

  const [videoId, setVideoId] = useState(event.videos ? event.videos[0].youtube : null);

  let dDayText = "";
  const [now, since, until] = [dayjs(), dayjs(event.since), dayjs(event.until)];
  if (now.isAfter(until)) {
    dDayText = "개최 종료";
  } else if (now.isAfter(since)) {
    dDayText = "개최중";
  } else {
    const daysDiff = since.startOf("day").diff(now.startOf("day"), "day");
    dDayText = (daysDiff === 0) ? "오늘" : `D-${daysDiff}`;
  }

  return (
    <>
      <div className="my-8">
        {event.image ?
          <div className="relative w-screen md:w-full -mx-4 md:mx-0">
            <img className="w-full md:rounded-xl" src={event.image} alt={`${event.name} 이벤트 이미지`} />
            <div className="absolute bottom-0 w-full px-4 md:px-6 py-4 text-white bg-gradient-to-t from-neutral-900/75 from-75% md:rounded-b-xl">
              <p className="text-sm md:text-base text-neutral-300">{eventLabelsMap[event.type]}</p>
              <p className="text-lg md:text-2xl font-bold">{event.name}</p>
              <div className="flex items-end">
                <p className="my-1 grow text-sm md:text-base">
                  {dayjs(event.since).format("YYYY-MM-DD")} ~ {dayjs(event.until).format("YYYY-MM-DD")}
                </p>
                <p className="py-1 px-4 flex-none bg-neutral-900 bg-opacity-75 text-xs md:text-sm rounded-full">{dDayText}</p>
              </div>
            </div>
          </div> :
          <div>
            <p className="text-sm md:text-base text-neutral-500">{eventLabelsMap[event.type]}</p>
            <p className="text-lg md:text-2xl font-bold">{event.name}</p>
            <div className="flex items-end">
              <p className="my-1 grow text-sm md:text-base">
                {dayjs(event.since).format("YYYY-MM-DD")} ~ {dayjs(event.until).format("YYYY-MM-DD")}
              </p>
              <p className="py-1 px-4 flex-none bg-neutral-900 text-white text-xs md:text-sm rounded-full">{dDayText}</p>
            </div>
          </div>
        }
      </div>

      {pickupStudents && (
        <div className="my-8">
          <SubTitle text="픽업 학생" />
          <StudentCards cardProps={pickupStudents} mobileGrid={5} />
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

      {event.videos && (
        <div className="my-8">
          <SubTitle text="이벤트 영상" />
          <div className="w-full flex flex-col-reverse md:flex-row border border-neutral-300 rounded-xl">
            <div className="w-full md:w-56 md:border-r md:flex-none flex flex-row md:flex-col overflow-auto">
              {event.videos.map((video) => (
                <div
                  key={`video-${video.youtube}`}
                  className={sanitizeClassName(`
                    m-1 p-3 md:w-54 text-sm md:text-base hover:bg-neutral-100
                    cursor-pointer transition rounded-xl
                    ${video.youtube === videoId ? "bg-gray-100 font-bold" : ""}
                  `)}
                  onClick={() => setVideoId(video.youtube)}
                >
                  <p className="whitespace-nowrap">{video.title}</p>
                </div>
              ))}
            </div>
            <div className="flex-auto">
              <iframe
                className="w-full aspect-video rounded-t-xl md:rounded-tl-none md:rounded-r-xl"
                src={`https://www.youtube.com/embed/${videoId}`} 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
