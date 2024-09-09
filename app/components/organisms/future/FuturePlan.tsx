import { Link } from "@remix-run/react";
import dayjs from "dayjs";
import { MemoEditor } from "~/components/molecules/editor";
import { ResourceCards, StudentCards } from "~/components/molecules/student";
import { pickupLabelLocale } from "~/locales/ko";
import { PickupType } from "~/models/content";

type FuturePlanProps = {
  events: {
    eventId: string;
    name: string;
    since: Date;
    memo: string | null;
    pickups: {
      type: string;
      rerun: boolean;
      student: {
        name: string;
        studentId: string;
        schaleDbId: string;
        equipments: string[];
      };
    }[];
  }[];
};

type MonthSummary = {
  month: dayjs.Dayjs;
  events: FuturePlanProps["events"];
  equipments: { [_: string]: number };
};

function toMonthString(month: dayjs.Dayjs): string {
  return month.format("YY/MM");
}

export default function FuturePlan({ events }: FuturePlanProps) {
  const beginMonth = dayjs().startOf("month");
  const endMonth = dayjs(events[events.length - 1].since).endOf("month");
  const months = Array.from({ length: endMonth.diff(beginMonth, "month") + 1 }, (_, i) => beginMonth.add(i, "month"));

  const monthSummaries: MonthSummary[] = months.map((month) => {
    const equipments: { [_: string]: number } = {};
    const monthEvents = events.filter((event) => dayjs(event.since).isSame(month, "month"));
    monthEvents.forEach((event) => {
      event.pickups.forEach(({ student }) => {
        student.equipments.forEach((equipment) => {
          if (!equipments[equipment]) {
            equipments[equipment] = 0;
          }
          equipments[equipment] += 1;
        });
      });
    });

    return {
      month,
      events: monthEvents,
      equipments,
    };
  });

  return (
    <table className="w-full md:mx-auto my-4 table-auto">
      <thead className="bg-neutral-100 text-left">
        <tr>
          <th className="p-2">일자</th>
          <th className="p-2">이벤트</th>
        </tr>
      </thead>
      <tbody>
        {monthSummaries.map(({ month, events, equipments }) => {
          return (
            <tr key={toMonthString(month)}>
              <td className="md:px-2 py-2 align-text-top">
                <p className="my-2">{toMonthString(month)}</p>
              </td>
              <td className="p-2">
                {(events.length > 0) ? 
                  events.map((event) => {
                    return (
                      <div key={event.eventId} className="my-2">
                        <Link to={`/events/${event.eventId}`} className="hover:underline">
                          <p className="font-bold text-lg">{event.name}</p>
                        </Link>
                        <p className="mb-2 text-neutral-500 text-sm">{dayjs(event.since).format("YYYY-MM-DD")}</p>
                        <StudentCards
                          mobileGrid={4}
                          students={event.pickups.map(({ student, type, rerun }) => ({
                            studentId: student.studentId,
                            name: student.name,
                            label: (
                              <span className={rerun ? "text-yellow-500" : "text-white"}>
                                {pickupLabelLocale({ type: type as PickupType, rerun })}
                              </span>
                            ),
                          }))}
                        />
                        {event.memo && <MemoEditor initialText={event.memo} />}
                      </div>
                    );
                  }) : <p className="my-2 text-neutral-300">(모집 일정 없음)</p>
                }
                {equipments && (
                  <ResourceCards
                    mobileGrid={5}
                    cardProps={Object.entries(equipments).map(([equipment, count]) => ({
                      id: `equipment-${equipment}`,
                      imageUrl: `https://assets.mollulog.net/assets/images/equipments/${equipment}`,
                      count,
                    }))}
                  />
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
