import events from "~/statics/events.json";

export type Pickup = {
  studentId: string;
  rerun: boolean;
  type: "usual" | "limited" | "given" | "fes";
};

export type PickupEvent = {
  id: string;
  name: string;
  type: "event" | "mini_event" | "pickup" | "fes";
  rerun: boolean;
  since: Date | null;
  until: Date | null;
  pickups: Pickup[];
};

export function getFutureEvents(): PickupEvent[] {
  return events.filter(({ until }) => !until || Date.parse(until) > new Date().getTime())
    .map((event) => ({
      ...event,
      type: event.type as PickupEvent["type"],
      since: event.since ? new Date(Date.parse(event.since)) : null,
      until: event.until ? new Date(Date.parse(event.until)) : null,
      pickups: event.pickups as Pickup[],
    }));
}
