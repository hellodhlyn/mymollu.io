import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Callout } from "~/components/atoms/typography";
import { PartyView } from "~/components/organisms/party";
import type { Env } from "~/env.server";
import { graphql } from "~/graphql";
import type { RaidForPartyQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getUserParties } from "~/models/party";
import { getUserStudentStates } from "~/models/student-state";

export const raidForPartyQuery = graphql(`
  query RaidForParty {
    raids {
      nodes { raidId name type boss terrain since }
    }
  }
`);

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""} - 편성 | MolluLog`.trim() },
    { name: "description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
    { name: "og:title", content: `${params.username || ""} - 편성 | MolluLog`.trim() },
    { name: "og:description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
  ];
};

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const usernameParam = params.username;
  if (!usernameParam || !usernameParam.startsWith("@")) {
    throw new Error("Not found");
  }

  const { data } = await runQuery<RaidForPartyQuery>(raidForPartyQuery, {});
  if (!data) {
    throw new Error("failed to load data");
  }

  const username = usernameParam.replace("@", "");
  const currentUsername = await getAuthenticator(env).isAuthenticated(request);
  const parties = (await getUserParties(env, username)).reverse();
  const states = await getUserStudentStates(env, username, true);

  return json({
    me: username === currentUsername?.username,
    states: states!,
    parties,
    raids: data.raids.nodes,
  });
};

export default function UserPartyPage() {
  const { me, states, parties, raids } = useLoaderData<typeof loader>();
  const isNewbee = me && parties.length === 0;

  return (
    <div className="my-8">
      {isNewbee && (
        <Callout className="my-4 flex">
          <span className="grow">✨ 학생 편성을 등록해보세요.</span>
          <Link to="/edit/parties" className="ml-1 underline">등록하러 가기 →</Link>
        </Callout>
      )}
      {parties.length === 0 && (
        <p className="my-16 text-center">
          아직 등록한 편성이 없어요
        </p>
      )}
      {parties.map((party) => (
        <PartyView
          key={`party-${party.uid}`}
          party={party}
          studentStates={states}
          raids={raids.map((raid) => ({ ...raid, since: new Date(raid.since) }))}
        />
      ))}
    </div>
  );
}
