import events from "~/statics/events.json";

export type Pickup = {
  studentId: string;
  rerun: boolean;
  type: "usual" | "limited" | "given" | "fes";
};

export type PickupEvent = {
  id: string;
  name: string;
  type: "event" | "mini_event" | "immortal_event" | "pickup" | "fes" | "campaign" | "exercise" | "main_story";
  rerun?: boolean;
  since: string;
  until: string;
  pickups: Pickup[];
};

export function getFutureEvents(): PickupEvent[] {
  return events.filter(({ until }) => !until || Date.parse(until) > new Date().getTime())
    .map((event) => ({
      ...event,
      type: event.type as PickupEvent["type"],
      pickups: event.pickups as Pickup[] ?? [],
    }));
}
