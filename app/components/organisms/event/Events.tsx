import { EventView, EventViewProps } from "~/components/molecules/event";

export default function Events({ eventProps }: { eventProps: EventViewProps[] }) {
  return (
    eventProps.map((eventProp) => (
      <EventView key={`event-${eventProp.id}`} {...eventProp} />
    ))
  )
}
