import { CheckCircle } from "iconoir-react";
import { EditTier, StudentCard } from "~/components/atoms/student";
import type { StudentState } from "~/models/student-state";

type StudentSpecEditProps = {
  state: StudentState;
  selected: boolean;
  onUpdate: (state: StudentState) => void;
  onSelect: (state: StudentState, selected: boolean) => void;
};

export default function StudentSpecEdit(
  { state, selected, onUpdate, onSelect }: StudentSpecEditProps,
) {
  const { student } = state;
  return (
    <div className="flex p-1 md:px-0 hover:bg-neutral-100 transition items-center rounded-lg">
      <CheckCircle
        className={`px-1 md:px-2 py-4 mr-1 h-14 w-8 md:w-10 ${selected ? "text-blue-500" : "text-neutral-300"} transition cursor-pointer`}
        strokeWidth={selected ? 2 : 1}
        onClick={() => onSelect(state, !selected)}
      />
      <div className="w-14">
        <StudentCard id={student.id} name={student.name} />
      </div>
      <div className="mx-4">
        <EditTier
          initialTier={student.initialTier}
          currentTier={state.tier ?? student.initialTier}
          onUpdate={(tier) => onUpdate({ ...state, tier })}
        />
      </div>
    </div>
  );
}
