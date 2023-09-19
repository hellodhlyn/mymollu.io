import { LoaderFunction, V2_MetaFunction, json, redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Authenticator } from "remix-auth";
import { Button } from "~/components/atoms/form";
import { SpecEditBulkActions, SpecEditor, useStateFilter } from "~/components/organisms/student";
import { Env } from "~/env.server";
import { Sensei } from "~/models/sensei";
import { StudentState, getUserStudentStates } from "~/models/studentState";
import { action } from "./edit.students";

export const meta: V2_MetaFunction = () => [
  { title: "학생 성장 관리 | MolluLog" },
];

type LoaderData = {
  currentUsername: string;
  states: StudentState[];
}

export const loader: LoaderFunction = async ({ context, request }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const sensei = await authenticator.isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  return json<LoaderData>({
    currentUsername: sensei.username,
    states: (await getUserStudentStates(context.env as Env, sensei.username, true))!!,
  });
};

export { action };

export default function EditSpecs() {
  const loaderData = useLoaderData<LoaderData>();
  const [states, setStates] = useState(loaderData.states);

  const [StateFilter, filteredStates] = useStateFilter(states, false, true);
  useEffect(() => {
    const orders = new Map();
    filteredStates.forEach((state, index) => orders.set(state.student.id, index));
    setStates((prev) => [
      ...prev.sort((a, b) => orders.get(a.student.id) - orders.get(b.student.id))
    ]);
  }, [filteredStates]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const setStatesBulkAction = (action: (prevState: StudentState) => StudentState) => {
    setStates((prev) => prev.map((prevState) => {
      if (selectedIds.includes(prevState.student.id)) {
        return action(prevState);
      } else {
        return prevState;
      }
    }));
  };

  return (
    <div className="my-8">
      {StateFilter}

      <SpecEditBulkActions
        selectedAny={selectedIds.length > 0}
        onToggleAll={(select) => {
          setSelectedIds(select ? loaderData.states.map(({ student }) => student.id) : [])
        }}
        onSelectTier={(tier) => {
          setStatesBulkAction((prev) => ({ ...prev, tier: prev.student.initialTier <= tier ? tier : prev.tier }));
          setSelectedIds([]);
        }}
      />

      <SpecEditor
        states={states.filter(({ owned }) => owned)}
        selectedIds={selectedIds}
        onUpdate={(state) => {
          setStates((prev) => prev.map((prevState) => prevState.student.id === state.student.id ? state : prevState));
        }}
        onSelect={(state, selected) => {
          if (selected && !selectedIds.includes(state.student.id)) {
            setSelectedIds((prev) => ([ ...prev, state.student.id ]));
          } else if (!selected && selectedIds.includes(state.student.id)) {
            setSelectedIds((prev) => prev.filter((prevId) => prevId !== state.student.id))
          }
        }}
      />

      <div className="my-8">
        <Form method="post">
          <input type="hidden" name="states" value={JSON.stringify(states.filter(({ owned }) => owned))} />
          <Button type="submit" text="저장하기" color="primary" />
        </Form>
      </div>
    </div>
  );
}
