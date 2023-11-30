import events from "~/statics/events.json";

export type Pickup = {
  studentId: string;
  rerun: boolean;
  type: "usual" | "limited" | "given" | "fes";
};

export type PickupEvent = {
  id: string;
  name: string;
  type: "event" | "mini_event" | "guide_mission" | "immortal_event" | "pickup" | "fes" | "campaign" | "exercise" | "main_story" | "collab";
  rerun?: boolean;
  since: string;
  until: string;
  image?: string;
  videos?: {
    title: string;
    youtube: string;
    start?: number;
  }[];
  tips?: {
    title: string;
    link: string;
    source: string;
  }[];
  pickups: Pickup[];
  hasDetail: boolean;
};

const detailedTypes = ["event", "immortal_event", "main_story"];

export function getAllEvents(): PickupEvent[] {
  return events.map((event) => ({
    ...event,
    type: event.type as PickupEvent["type"],
    pickups: event.pickups as Pickup[] ?? [],
    hasDetail: detailedTypes.includes(event.type),
  }));
}

export function getFutureEvents(): PickupEvent[] {
  return getAllEvents().filter(({ until }) => !until || Date.parse(until) > new Date().getTime())
}

export function pickupLabel({ type, rerun }: Pick<Pickup, "type" | "rerun">): string {
  const labelTexts: string[] = [];
  if (type === "given") {
    labelTexts.push("배포");
  } else if (type === "limited") {
    labelTexts.push("한정");
  } else if (type === "fes") {
    labelTexts.push("페스");
  }

  if (type !== "given") {
    if (rerun) {
      labelTexts.push("복각");
    } else {
      labelTexts.push("신규");
    }
  }

  return labelTexts.join(" ");
}

export const eventLabelsMap = {
  "event": "이벤트",
  "immortal_event": "이벤트 상설화",
  "mini_event": "미니 이벤트",
  "guide_mission": "가이드 미션",
  "collab": "콜라보 이벤트",
  "fes": "페스 이벤트",
  "pickup": "모집",
  "campaign": "캠페인",
  "exercise": "종합전술시험",
  "main_story": "메인 스토리",
};
