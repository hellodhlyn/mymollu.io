import EventTimelineItem, { type EventTimelineItemProps } from "./EventTimelineItem";
import RaidTimelineItem, { type RaidTimelineItemProps } from "./RaidTimelineItem";

type TimelineItemProps = {
  raid?: RaidTimelineItemProps;
  event?: EventTimelineItemProps;
};

export default function TimelineItem(props: TimelineItemProps) {
  if (props.raid) {
    return <RaidTimelineItem {...props.raid} />;
  } else if (props.event) {
    return <EventTimelineItem {...props.event} />;
  } else {
    return null;
  }
}
