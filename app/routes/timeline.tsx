import { Title } from "~/components/atoms/typography";

type TimelineItem = {
  id: string;
  title: string;
  imageUrl: string;
  prevItems: {
    id: string;
    reason: string;
  }[];
};

const timelineItems: TimelineItem[] = [
  {
    "id": "mainstory-final",
    "title": "그리고 모든 기적이 시작되는 곳",
    "imageUrl": "https://assets.mollulog.net/assets/images/events/mainstory-final-4.jpeg",
    "prevItems": [],
  },
  {
    "id": "mainstory-4-2",
    "title": "카르바노그의 토끼편 2장",
    "imageUrl": "https://assets.mollulog.net/assets/images/events/mainstory-we-were-rabbits-1.jpeg",
    "prevItems": [
      {
        "id": "mainstory-final",
        "reason": "최종편에서 선생을 구해준 RABBIT 소대와의 이야기에서 이어짐"
      },
    ],
  },
  {
    "id": "mainstory-1-3",
    "title": "대책위원회편 3장 (현재 시점)",
    "imageUrl": "https://assets.mollulog.net/assets/images/events/mainstory-foreclosure-tf-3-prologue.jpeg",
    "prevItems": [
      {
        "id": "mainstory-final",
        "reason": "학생들이 최종편 시점 이후에 있었던 일에 대해 언급"
      },
    ],
  },
  {
    "id": "merry-christmas",
    "title": "성당의 메리 크리스마스",
    "imageUrl": "https://assets.mollulog.net/assets/images/events/event-cathedrals-merry-christmas.jpg",
    "prevItems": [
      {
        "id": "mainstory-final",
        "reason": "미네와 처음 만난 에덴조약 편 이후, 작중 크리스마스 시점의 이야기"
      }
    ],
  },
  {
    "id": "calling-card",
    "title": "순백의 예고장",
    "imageUrl": "https://assets.mollulog.net/assets/images/events/20231031-calling-card.jpeg",
    "prevItems": [
      {
        "id": "mainstory-final",
        "reason": "아리스의 빗자루에 최종편 후일편에 등장한 케이의 키링이 달려있음",
      },
    ],
  },
  {
    "id": "trip-trap-train",
    "title": "Trip-Trap-Train",
    "imageUrl": "https://assets.mollulog.net/assets/images/events/event-triptraptrain.jpg",
    "prevItems": [
      {
        "id": "mainstory-final",
        "reason": "카스미와 처음 만난 최종편 이후의 시점"
      },
    ],
  },
  {
    "id": "0068-opera",
    "title": "0068 오페라로부터 사랑을 담아서!",
    "imageUrl": "https://assets.mollulog.net/assets/images/events/event-0068-from-opera-with-love.jpeg",
    "prevItems": [
      {
        "id": "trip-trap-train",
        "reason": "Trip-Tran-Train에서 등장했던 갱 연합보스 '돈 아란치노'가 이어서 등장",
      },
    ],
  },
  {
    "id": "mainstory-5-1",
    "title": "백화요란편 1장",
    "imageUrl": "https://assets.mollulog.net/assets/images/events/mainstory-hyakkaryouran-1-1.jpeg",
    "prevItems": [
      {
        "id": "mainstory-4-2",
        "reason": "선생 및 학생, 시민들의 대화에서 최종편 시점에 있었던 각종 사건들이 언급됨",
      }
    ],
  },
  {
    "id": "their-serenade",
    "title": "빛으로 나아가는 그녀들의 소야곡",
    "imageUrl": "https://assets.mollulog.net/assets/images/events/event-serenade.png",
    "prevItems": [
      {
        "id": "merry-christmas",
        "reason": "최종편 이후, 작중 발렌타인 데이 시점의 이야기",
      },
    ],
  },
  {
    "id": "niginigi-to-yukiyuki-te",
    "title": "와글와글하고 오손도손하게",
    "imageUrl": "https://assets.mollulog.net/assets/images/events/event-niginigi-to-yukiyuki-te.jpeg",
    "prevItems": [
      {
        "id": "mainstory-5-1",
        "reason": "백화요란편에서 재결합한 백화요란 분쟁조정위원회가 활동하는 장면이 등장",
      },
    ]
  },
  {
    "id": "ive-alive",
    "title": "-ive aLIVE!",
    "imageUrl": "https://assets.mollulog.net/assets/images/events/ive-alive.jpg",
    "prevItems": [
      {
        "id": "trip-trap-train",
        "reason": "이치카와의 대화 내용에서 Trip-Trap-Train 시점의 내용이 존재"
      },
    ],
  }
];

const timetable: (TimelineItem | null)[][] = [];
const visited = new Set<string>();

function visitItem(item: TimelineItem) {
  if (visited.has(item.id)) {
    return;
  }
  visited.add(item.id);

  const prevItem = item.prevItems[0];
  const prevItemTime = timetable.findIndex((items) => items.some((timetableItem) => prevItem.id === timetableItem?.id));
  const prevItemPos  = (prevItemTime < 0) ? 0 : timetable[prevItemTime].findIndex((timetableItem) => timetableItem?.id === prevItem.id);
  if (prevItemTime < 0 || prevItemTime === timetable.length - 1) {
    const newTimeline = Array(prevItemPos).fill(null);
    newTimeline.push(item);
    timetable.push(newTimeline);
  } else {
    const timeline = timetable[prevItemTime + 1];
    if (timeline.length < prevItemPos) {
      timeline.push(...Array(prevItemPos - timeline.length).fill(null));
    }
    timeline.push(item);

    const prevTimeline = timetable[prevItemTime];
    if (!!prevTimeline[prevItemPos + 1]) {
      prevTimeline.splice(prevItemPos + 1, 0, null);
    }
  }

  const nextItems = timelineItems.filter((nextItem) => nextItem.prevItems.some((prevItem) => prevItem.id === item.id));
  if (nextItems.length > 0) {
    nextItems.forEach((nextItem) => {
      visitItem(nextItem);
    });
  }
}

visitItem(timelineItems[0]);

const timelineItemsMap: Record<string, TimelineItem> = {};
timelineItems.forEach((item) => {
  timelineItemsMap[item.id] = item;
});

function TimelineNode({ item, hasAbove, hasBelow, hasLeft, hasRight }: { item: TimelineItem | null, hasAbove: boolean, hasBelow: boolean, hasLeft: boolean, hasRight: boolean }) {
  return (
    <div className="w-72 flex-shrink-0">
      <div className="w-full h-8 flex items-left justify-center">
        <div className={`w-1/2 h-0.5 ${hasLeft ? "bg-neutral-300" : ""}`} />
        {item && hasAbove && <div className="w-0.5 h-full left-1/2 bg-neutral-300" />}
        <div className={`w-1/2 h-0.5 ${hasRight ? "bg-neutral-300" : ""}`} />
      </div>
      <div className="px-2">
        {item ? (
          <div className="w-full h-72 items-center border border-neutral-100 rounded-xl shadow-xl">
            <img src={item.imageUrl} alt={item.title} className="w-full aspect-video rounded-t-xl" />
            <div className="m-4">
              <p className="font-bold">{item.title}</p>
              {item.prevItems.length > 0 && (
                <ul className="text-sm">
                  {item.prevItems.map((prevItem) => (
                    <li key={prevItem.id}>{prevItem.reason}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-72" />
        )}
      </div>
      {item && (
        <div className="w-full h-8 flex justify-center">
          {hasBelow && <div className="w-0.5 h-full bg-neutral-300" />}
        </div>
      )}
    </div>
  );

}

export default function Timeline() {
  return (
    <div className="pb-64">
      <Title text="키보토스 시간선" />
      <div className="w-screen px-8 pb-64 absolute left-0">
        <div className="">
          {timetable.map((items, time) => (
            <div key={time} className="w-full flex">
              {items.map((item, pos) => {
                const prevTimeline = timetable[time - 1];
                const prevItemPos = time === 0 ? -1 : prevTimeline.findIndex((prevItem) => prevItem && (prevItem.id === item?.prevItems[0]?.id));

                const hasAbove = time > 0;
                const hasBelow = (timetable.length - 1 > time) && (timetable[time + 1].length > pos) && timetable[time + 1][pos] !== null;
                const hasLeft = !!item && time > 0 && pos > 0 && prevItemPos < pos;
                const hasRight = !!item && time > 0 && (
                  (item == null && hasLeft) ||
                  !!timetable[time].find((rightItem, idx) => rightItem && (idx > pos) && rightItem.prevItems[0].id === item?.prevItems[0]?.id)
                );

                return (
                  <TimelineNode
                    key={item?.id ?? `empty-${time}-${pos}`} item={item}
                    hasAbove={hasAbove} hasBelow={hasBelow} hasLeft={hasLeft} hasRight={hasRight}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
