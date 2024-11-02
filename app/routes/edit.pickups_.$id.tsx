import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import dayjs from "dayjs";
import { useState } from "react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Button, Input, Label, Textarea } from "~/components/atoms/form";
import { StudentCard } from "~/components/atoms/student";
import { Title } from "~/components/atoms/typography";
import { ContentSelector } from "~/components/molecules/editor";
import { filterStudentByName } from "~/filters/student";
import { PickupEventsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { createPickupHistory, getPickupHistory, parsePickupHistory, PickupHistory } from "~/models/pickup-history";
import { pickupEventsQuery } from "./edit.pickups";

export const meta: MetaFunction = () => [
  { title: "모집 이력 관리 | 몰루로그" },
];

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  let pickupHistory = null;
  if (params.id) {
    pickupHistory = await getPickupHistory(env, sensei.id, params.id);
  }

  const { data, error } = await runQuery<PickupEventsQuery>(pickupEventsQuery, {});
  if (!data) {
    console.error(error);
    throw "failed to load data";
  }

  const now = dayjs();
  return json({
    events: data.events.nodes.filter((event) => event.pickups.length > 0 && dayjs(event.since).isBefore(now)).reverse(),
    students: data.students,
    pickupHistory,
  });
};

type ActionBody = {
  eventId: string;
  result: PickupHistory["result"];
  rawResult: string;
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const data = await request.json<ActionBody>();

  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  await createPickupHistory(
    context.cloudflare.env,
    sensei.id,
    data.eventId,
    data.result,
    data.rawResult
  );

  return redirect("/edit/pickups");
}

type PickupStudentCardProps = {
  studentId: string | null;
  tier3Students: Map<string, string>;
  onChange: (studentId: string) => void;
};

function PickupStudentCard({ studentId, tier3Students, onChange }: PickupStudentCardProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const studentNames = Array.from(tier3Students.keys()).map((name) => ({ name }));
  const searchResult = filterStudentByName(search, studentNames);

  return (
    <div className="w-12 group">
      <div className="relative w-full">
        <StudentCard studentId={studentId} />
        <div
          className="absolute w-full h-full rounded-lg top-0 left-0 bg-black flex items-center justify-center bg-opacity-0 group-hover:bg-opacity-50 transition cursor-pointer"
          onClick={() => setOpen((prev) => !prev)}
        >
          <PencilSquareIcon className="hidden group-hover:block size-4 text-white" />
        </div>
      </div>
      {open && (
        <div className="absolute w-full left-0 my-2 px-4 py-2 bg-white z-10 rounded-lg border">
          <Input label="학생 찾기" placeholder="이름으로 찾기..." onChange={setSearch} />
          {searchResult.length > 0 && (
            <div className="p-2 flex gap-x-2 bg-neutral-100 rounded-lg">
              {searchResult.slice(0, 5).map(({ name }) => (
                <div
                  key={name}
                  className="w-12 hover:opacity-75 cursor-pointer transition"
                  onClick={() => {
                    onChange(tier3Students.get(name) ?? "");
                    setOpen(false);
                  }}
                >
                  <StudentCard studentId={tier3Students.get(name)!} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EditPickup() {
  const { events, students, pickupHistory } = useLoaderData<typeof loader>();
  const initialEvent = pickupHistory ? events.find((event) => event.eventId === pickupHistory.eventId) : null;

  const [eventId, setEventId] = useState<string | null>(initialEvent?.eventId ?? null);

  const [result, setResult] = useState<PickupHistory["result"]>(pickupHistory?.result ?? []);
  const [rawResult, setRawResult] = useState("");

  const submit = useSubmit();


  const allTier3Students = new Map(students.filter((student) => student.initialTier === 3).map((student) => [student.name, student.studentId]));
  return (
    <>
      <Title text="모집 이력 관리" />
      <ContentSelector
        contents={events.map((event) => ({
          contentId: event.eventId,
          name: event.name,
          imageUrl: null,
          description: (
            <div className="flex gap-x-2">
              {event.pickups.map((pickup) => (
                <div className="w-8" key={pickup.studentName}>
                  <StudentCard studentId={pickup.student?.studentId ?? null} />
                </div>
              ))}
            </div>
          ),
        }))}
        placeholder="모집 컨텐츠를 선택하세요"
        initialContentId={eventId ?? undefined}
        onSelectContent={setEventId}
      />

      {result.length === 0 ?
        <Textarea
          className="max-w-4xl"
          label="모집 결과"
          description="10연 모집의 결과를 입력 한 줄에 하나씩 입력"
          placeholder="1/2/7 드요코&#10;1 3 6 밴즈사&#10;..."
          onChange={(value) => setRawResult(value)}
        /> :
        <>
          <Label text="모집 결과" />
          <table>
            <thead className="bg-neutral-100 rounded-lg">
              <tr>
                <th className="px-4 py-2 rounded-l-lg">횟수</th>
                <th className="p-2">★3</th>
                <th className="p-2">★2</th>
                <th className="p-2">★1</th>
                <th className="p-2 pr-4 rounded-r-lg">모집 ★3 학생</th>
              </tr>
            </thead>
            <tbody>
              {result.map((eachResult) => {
                const tier3Students = new Array(eachResult.tier3Count).fill(null);
                eachResult.tier3StudentIds.forEach((studentId, index) => {
                  if (index < tier3Students.length) {
                    tier3Students[index] = studentId;
                  }
                });

                return (
                  <tr key={`trial-${eachResult.trial}`} className="relative py-2 hover:bg-neutral-100 transition">
                    <td className="px-4 p-2 font-bold rounded-l-lg">{eachResult.trial}</td>
                    <td className="p-2">{eachResult.tier3Count}</td>
                    <td className="p-2">{eachResult.tier2Count}</td>
                    <td className="p-2">{eachResult.tier1Count}</td>
                    <td className="rounded-r-lg">
                      <div className="flex gap-x-2">
                        {tier3Students.map((studentId, index) => (
                          <PickupStudentCard
                            key={`student-${studentId ?? index}`}
                            studentId={studentId}
                            tier3Students={allTier3Students}
                            onChange={(newStudentId) => {
                              const newResult = [...result];
                              newResult.find((result) => result.trial === eachResult.trial)!.tier3StudentIds[index] = newStudentId;
                              setResult(newResult);
                            }}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="py-2">
                <td className="px-4 p-2 font-bold">합계</td>
                <td className="p-2">{result.map((eachResult) => eachResult.tier3Count).reduce((a, b) => a + b)}</td>
                <td className="p-2">{result.map((eachResult) => eachResult.tier2Count).reduce((a, b) => a + b)}</td>
                <td className="p-2 pr-4">{result.map((eachResult) => eachResult.tier1Count).reduce((a, b) => a + b)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </>
      }

      {result.length === 0 ?
        <Button
          text="입력 결과 미리보기"
          onClick={() => setResult(parsePickupHistory(rawResult, allTier3Students))}
        /> :
        <Form>
          <Button 
            color="primary" text="저장하기"
            onClick={() => {
              if (!eventId) {
                return;
              }
              submit(
                { eventId, result, rawResult } as ActionBody,
                { method: "post", encType: "application/json" },
              );
            }}
          />
          <Button text="다시 입력하기" onClick={() => setResult([])} />
        </Form>
      }
    </>
  );
}
