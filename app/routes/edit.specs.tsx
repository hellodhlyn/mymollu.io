import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { FloatingButton } from "~/components/atoms/form";
import { SpecEditBulkActions, SpecEditor, useStateFilter } from "~/components/organisms/student";
import type { Env } from "~/env.server";
import type { StudentState} from "~/models/studentState";
import { getUserStudentStates } from "~/models/studentState";
import { action, type ActionData } from "./edit.students";
import { useToast } from "~/components/atoms/notification";
import { getAuthenticator } from "~/auth/authenticator.server";

export const meta: MetaFunction = () => [
  { title: "학생 성장 관리 | MolluLog" },
];

type LoaderData = {
  currentUsername: string;
  states: StudentState[];
}

export const loader: LoaderFunction = async ({ context, request }) => {
  const env = context.env as Env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  return json<LoaderData>({
    currentUsername: sensei.username,
    states: (await getUserStudentStates(env, sensei.username, true))!,
  });
};

export { action };

export default function EditSpecs() {
  const loaderData = useLoaderData<LoaderData>();
  const fetcher = useFetcher<ActionData>();
  const [Toast, showToast] = useToast({
    children: (
      <p>
        성공적으로 저장했어요.&nbsp;
        <Link to="/my?path=students">
          <span className="underline">학생 목록 보러가기 →</span>
        </Link>
      </p>
    ),
  });

  useEffect(() => {
    if (fetcher.state === "loading" && !fetcher.data?.error) {
      showToast();
    }
  }, [fetcher]);

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

      <fetcher.Form method="post">
        <input type="hidden" name="states" value={JSON.stringify(states.filter(({ owned }) => owned))} />
        <FloatingButton state={fetcher.state} />
      </fetcher.Form>

      {Toast}
    </div>
  );
}
