import { CheckCircle } from "iconoir-react";
import { useEffect, useState } from "react";
import { EditTier, StudentCard } from "~/components/atoms/student";
import { StudentState } from "~/models/studentState";

type SpecEditProps = {
  state: StudentState;
  selected: boolean;
  onUpdate: (state: StudentState) => void;
  onSelect: (state: StudentState, selected: boolean) => void;
};

export default function SpecEdit(
  { state, selected, onUpdate, onSelect }: SpecEditProps,
) {
  const { student } = state;
  return (
    <div className="flex p-1 hover:bg-gray-100 transition items-center rounded-lg">
      <CheckCircle
        className={`px-2 py-4 mr-1 h-14 w-10 ${selected ? "text-blue-500" : "text-gray-300"} transition cursor-pointer`}
        strokeWidth={selected ? 2 : 1}
        onClick={() => onSelect(state, !selected)}
      />
      <div className="w-12">
        <StudentCard id={student.id} imageUrl={student.imageUrl} />
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
