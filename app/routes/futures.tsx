import { LoaderFunction, json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { Authenticator } from "remix-auth";
import { SubTitle, Title } from "~/components/atoms/typography";
import { StudentCards } from "~/components/molecules/student";
import { Events } from "~/components/organisms/event";
import { PickupEvent, getFutureEvents } from "~/models/event";
import { Student, getAllStudents } from "~/models/student";

type LoaderData = {
  signedIn: boolean;
  events: PickupEvent[];
  allStudents: Student[];
};

export const loader: LoaderFunction = ({ context, request }) => {
  const authenticator = context.authenticator as Authenticator;
  const signedIn = authenticator.isAuthenticated(request) !== null;

  const events = getFutureEvents();
  const eventStudentIds = events.flatMap((event) => (
    [...event.pickups, ...event.givens].map((student) => student.studentId)
  ));

  return json<LoaderData>({
    signedIn,
    events: getFutureEvents(),
    allStudents: getAllStudents(true).filter(({ id }) => eventStudentIds.includes(id)),
  });
};

export default function Futures() {
  const { signedIn, events, allStudents } = useLoaderData<LoaderData>();
  return (
    <>
      <Title text="미래시" />
      {signedIn ?
        <p>학생을 선택하여 성장에 필요한 재화량을 계산할 수 있어요.</p> :
        <p><Link to="/signin" className="underline">로그인</Link> 후 학생을 선택하여 성장에 필요한 재화량을 계산할 수 있어요.</p>
      }
      <Events
        eventProps={events.map((event) => ({
          ...event,
          since: new Date(Date.parse(event.since)),
          until: new Date(Date.parse(event.until)),
          givens: event.givens.map((given) => ({
            student: allStudents.find(({ id }) => given.studentId === id)!,
            rerun: given.rerun,
            limited: false,
          })),
          pickups: event.pickups.map((pickup) => ({
            student: allStudents.find(({ id }) => pickup.studentId === id)!,
            rerun: pickup.rerun,
            limited: pickup.limited ?? false,
          })),
        }))}
      />
    </>
  );
}
