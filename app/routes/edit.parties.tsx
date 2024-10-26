import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { PlusCircle } from "iconoir-react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Title } from "~/components/atoms/typography";
import { PartyView } from "~/components/organisms/party";
import { graphql } from "~/graphql";
import type { RaidForPartyEditQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getUserParties } from "~/models/party";
import { getUserStudentStates } from "~/models/student-state";
import { sanitizeClassName } from "~/prophandlers";

export const raidForPartyEditQuery = graphql(`
  query RaidForPartyEdit {
    raids {
      nodes { raidId name type boss terrain since until }
    }
  }
`);

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/signin");
  }

  const raidQueryResult = await runQuery<RaidForPartyEditQuery>(raidForPartyEditQuery, {});
  if (!raidQueryResult.data) {
    throw "failed to load data";
  }

  const parties = (await getUserParties(env, currentUser.username)).reverse();
  const states = await getUserStudentStates(env, currentUser.username, true);
  return json({ parties, states, raids: raidQueryResult.data.raids.nodes });
};

export default function EditParties() {
  const { parties, states, raids } = useLoaderData<typeof loader>();
  return (
    <>
      <Title text="편성 관리" />
      <div className="max-w-4xl">
        <Link to="/edit/parties/new">
          <div className={sanitizeClassName(`
            my-4 p-4 flex justify-center items-center border border-neutral-200
            rounded-lg text-neutral-500 hover:bg-neutral-100 transition cursor-pointer
          `)}>
            <PlusCircle className="h-4 w-4 mr-2" strokeWidth={2} />
            <span>새로운 편성 추가하기</span>
          </div>
        </Link>
        {parties.map((party) => (
          <PartyView
            key={party.uid}
            party={party}
            raids={raids.map((raid) => ({
              ...raid,
              since: new Date(raid.since),
              until: new Date(raid.until),
            }))}
            studentStates={states || []}
            editable
          />
        ))}
      </div>
    </>
  );
}
