import { getDB, type Env } from "~/env.server";
import { fetchCached } from "./base";

export type Pickup = {
  studentId: string;
  name?: string;
  rerun: boolean;
  type: "usual" | "limited" | "given" | "fes";
};

export type GameEvent = {
  id: string;
  name: string;
  type: "event" | "mini_event" | "guide_mission" | "immortal_event" | "pickup" | "fes" | "campaign" | "exercise" | "main_story" | "collab";
  rerun?: boolean;
  since: string;
  until: string;
  image: string | null;
  videos: {
    title: string;
    youtube: string;
    start: number | null;
  }[] | null;
  tips: {
    title: string;
    link: string;
    source: string;
  }[] | null;
  pickups: Pickup[];
};

const allEventKey = "cache:all-events";
const detailedTypes = ["event", "immortal_event", "main_story"];

export async function getAllEvents(env: Env): Promise<GameEvent[]> {
  return fetchCached(env, allEventKey, async () => {
    const db = getDB(env);
    const { data, error } = await db.from("events").select("*");
    if (error || !data) {
      throw error ?? "failed to fetch events";
    }

    return data.filter((event) => ((env.STAGE === "dev") || event.visible)).map((event) => ({
      ...event,
      id: event.eventId,
      type: event.type as GameEvent["type"],
      videos: event.videos as GameEvent["videos"] ?? [],
      tips: event.tips as GameEvent["tips"] ?? [],
      pickups: event.pickups as Pickup[] ?? [],
    }));
  }, 5 * 60);
}

export async function getFutureEvents(env: Env): Promise<GameEvent[]> {
  const allEvents = await getAllEvents(env);
  return allEvents.filter(({ until }) => !until || Date.parse(until) > new Date().getTime())
}

export function detailedEvent(eventType: GameEvent["type"]): boolean {
  return detailedTypes.includes(eventType);
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

export const eventLabelsMap: { [key in GameEvent["type"]]: string } = {
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
