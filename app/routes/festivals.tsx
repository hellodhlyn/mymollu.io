import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { MapPinIcon, HomeIcon } from "@heroicons/react/16/solid";
import { KeyValueTable, Title } from "~/components/atoms/typography";

type Festival = {
  id: string;
  type: "stamp-rally" | "offline-festival" | "collab" | "concert";
  name: string;
  location: string;
  thumbnail: string;
  link?: string;
  schedules: {
    name: string;
    since: string;
    until: string;
  }[];
};

const festivalTypeLocales: Record<Festival["type"], string> = {
  "offline-festival": "페스티벌",
  "collab": "콜라보 행사",
  "stamp-rally": "스탬프 랠리",
  "concert": "공연",
};

function timeToSort(festival: Festival): dayjs.Dayjs {
  const now = dayjs();
  let time = dayjs(festival.schedules[festival.schedules.length - 1].since);
  festival.schedules.forEach((schedule) => {
    const since = dayjs(schedule.since);
    const until = dayjs(schedule.until);
    if (now.isAfter(since) && now.isBefore(until)) {
      time = since;
    }
  });
  return time;
}

export const meta: MetaFunction = () => {
  const title = "블루 아카이브 행사 정보";
  const description = "블루 아카이브 한국/일본 서버에서 진행하는 행사 정보 모음";
  return [
    { title: `${title} | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const now = dayjs();
  const festivals = JSON.parse(await context.cloudflare.env.KV_STATIC_DATA.get("festivals") ?? "[]") as Festival[];

  return json({
    festivals: festivals
      .filter((festival) => dayjs(festival.schedules[festival.schedules.length - 1].since).isAfter(now))
      .sort((a, b) => timeToSort(a).diff(timeToSort(b))),
  });
};

export default function Festivals() {
  const { festivals } = useLoaderData<typeof loader>();

  const scheduleKV = (festival: Festival) => {
    return festival.schedules.map((schedule) => {
      const since = dayjs(schedule.since);
      const until = dayjs(schedule.until);
      const now = dayjs();
      return {
        key: schedule.name,
        value: (
          <div className="flex items-center relative">
            <span>
              {since.format("MM/DD HH:mm")} ~ {until.format("MM/DD HH:mm")}
            </span>
            {now.isAfter(since) && now.isBefore(until) && (
              <div className="absolute -right-2 top-0 size-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
        ),
      };
    });
  };

  return (
    <div className="pb-64">
      <Title text="오프라인 행사" />
      {festivals.map((festival) => (
        <div key={festival.id} className="my-8 w-full flex flex-col md:flex-row border border-neutral-300 rounded-lg">
          <div className="w-full h-48 md:max-w-64 md:h-auto relative">
            <img src={festival.thumbnail} alt={festival.name} className="w-full h-full object-cover rounded-t-lg md:rounded-tr-none md:rounded-bl-lg" />
            <div className="absolute top-0 left-0 p-2 m-1">
              <span className="py-1 px-4 bg-neutral-900 bg-opacity-75 text-sm text-white rounded-full">
                {festivalTypeLocales[festival.type]}
              </span>
            </div>
          </div>

          <div className="grow px-6 py-4">
            <p className="my-2 text-xl font-bold">{festival.name}</p>
            <p className="my-1 text-sm flex items-center text-neutral-700">
              <MapPinIcon className="size-4" />
              <span className="ml-1">{festival.location}</span>
            </p>
            {festival.link && (
              <p className="my-1 text-sm flex items-center text-neutral-700">
                <HomeIcon className="size-4 inline-block" />
                <a href={festival.link} target="_blank" rel="noreferrer" className="ml-1 underline hover:opacity-50">
                  {new URL(festival.link).hostname}
                </a>
              </p>
            )}

            <div className="mt-4 mb-2">
              <KeyValueTable items={scheduleKV(festival)} keyPrefix={`schedule-${festival.id}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
