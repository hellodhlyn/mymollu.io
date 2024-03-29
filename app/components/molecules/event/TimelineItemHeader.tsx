import { Link } from "@remix-run/react";
import dayjs, { Dayjs } from "dayjs";
import { NavArrowRight } from "iconoir-react";
import { MultilineText } from "~/components/atoms/typography";

type TimelineItemHeaderProps = {
  title: string;
  label: string;
  eventSince: Dayjs;
  eventUntil: Dayjs;
  link?: string;
};

export function TimelineItemHeader({ title, label, eventSince, eventUntil, link }: TimelineItemHeaderProps) {
  const remainingDays = eventUntil.diff(dayjs(), "day");
  let remainingDaysText = "";
  if (eventSince.isBefore(dayjs())) {
    if (remainingDays === 1) {
      remainingDaysText = "내일 종료";
    } else if (remainingDays === 0) {
      remainingDaysText = "오늘 종료";
    } else {
      remainingDaysText = `${remainingDays}일 남음`;
    }
  }

  return (
    <>
    <div className="md:my-1 flex items-center gap-x-2">
      <span className="text-sm text-neutral-500">
        {label}
      </span>
      {remainingDaysText && (
        <span className="py-0.5 px-2 text-xs bg-neutral-900 text-white rounded-full">
          {remainingDaysText}
        </span>
      )}
    </div>

    {
      link ?
      (
        <Link to={link} >
          <div className="mb-2 flex items-end group">
            <MultilineText
              className="font-bold text-lg md:text-xl group-hover:underline cursor-pointer"
              texts={title.split("\n")}
            />
            <NavArrowRight className="h-4 w-4 mb-1.5" strokeWidth={2} />
          </div>
        </Link>
      ) :
      (
        <MultilineText className="mb-2 font-bold text-lg md:text-xl" texts={title.split("\n")} />
      )
    }
  </>
  );
};
