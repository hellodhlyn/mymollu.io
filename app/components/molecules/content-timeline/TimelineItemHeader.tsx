import { Link } from "@remix-run/react";
import dayjs from "dayjs";
import { NavArrowRight } from "iconoir-react";
import { MultilineText } from "~/components/atoms/typography";

type TimelineItemHeaderProps = {
  title: string;
  label: string;
  since: Date;
  until: Date;
  link?: string;
};

export function TimelineItemHeader({ title, label, since, until, link }: TimelineItemHeaderProps) {
  const sinceDayjs = dayjs(since);
  const untilDayjs = dayjs(until);
  const now = dayjs();

  const remainingDays = untilDayjs.endOf("day").diff(now.endOf("day"), "day");
  let remainingDaysText = "";
  if (sinceDayjs.isBefore(now)) {
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
