import { json, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Title } from "~/components/atoms/typography";
import { ContentTimeline, ContentTimelineProps } from "~/components/organisms/content";
import { graphql } from "~/graphql";
import { NewFutureContentsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";

export const newFutureContentsQuery = graphql(`
  query NewFutureContents($now: ISO8601DateTime!) {
    contents(untilAfter: $now, first: 9999) {
      nodes {
        name
        since
        until
        ... on Event {
          contentId: eventId
          eventType: type
          rerun
          pickups {
            type
            rerun
            student { studentId attackType defenseType role schaleDbId }
            studentName
          }
        }
        ... on Raid {
          contentId: raidId
          raidType: type
          boss terrain attackType defenseType
        }
      }
    }
  }
`);

export const meta: MetaFunction = () => {
  const title = "블루 아카이브 이벤트, 픽업 미래시";
  const description = "블루 아카이브 한국 서버의 이벤트 및 총력전, 픽업 미래시 정보 모음";
  return [
    { title: `${title} | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

export const loader = async () => {
  const { data, error } = await runQuery<NewFutureContentsQuery>(newFutureContentsQuery, { now: new Date().toISOString() });
  if (error || !data) {
    throw error ?? "failed to fetch events";
  }

  return json({
    contents: data.contents.nodes,
  });
};

export default function Futures() {
  const { contents } = useLoaderData<typeof loader>();

  return (
    <div className="pb-64">
      <Title text="미래시" />
      <ContentTimeline
        contents={contents.map((content) => {
          const contentAttrs: Partial<ContentTimelineProps["contents"][number]> = {
            ...content,
            since: new Date(content.since),
            until: new Date(content.until),
          };

          if (content.__typename === "Event") {
            contentAttrs.contentType = content.eventType;
            contentAttrs.rerun = content.rerun;
            contentAttrs.pickups = content.pickups ?? undefined;
          } else if (content.__typename === "Raid") {
            contentAttrs.contentType = content.raidType;
            contentAttrs.rerun = false;
            contentAttrs.raidInfo = {
              boss: content.boss,
              terrain: content.terrain,
              attackType: content.attackType,
              defenseType: content.defenseType,
            };
          }

          return contentAttrs as ContentTimelineProps["contents"][number];
        })}
      />
    </div>
  );
}
