import events from "~/statics/events.json";

type Pickup = {
  studentId: string;
  rerun: boolean;
  limited?: boolean;
};

export type PickupEvent = {
  id: string;
  name: string;
  type: "event" | "mini_event" | "pickup" | "fes";
  rerun: boolean;
  since: Date;
  until: Date;
  givens: Pickup[];
  pickups: Pickup[];
};

export function getFutureEvents(): PickupEvent[] {
  return events.filter(({ until }) => Date.parse(until) > new Date().getTime())
    .map((event) => ({
      ...event,
      type: event.type as PickupEvent["type"],
      since: new Date(Date.parse(event.since)),
      until: new Date(Date.parse(event.until)),
    }));
}
