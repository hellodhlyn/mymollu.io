import { SpecEdit } from "~/components/molecules/editor";
import type { StudentState } from "~/models/student-state";

type SpecEditorProps = {
  states: StudentState[];
  selectedIds: string[];
  onUpdate: (state: StudentState) => void;
  onSelect: (state: StudentState, selected: boolean) => void;
}

export default function SpecEditor({ states, selectedIds, onUpdate, onSelect }: SpecEditorProps) {
  return (
    <div className="my-8">
      <p className="my-2 font-bold text-xl">학생 목록</p>
      {states.map((state) => (
        <SpecEdit
          key={`spec-editor-${state.student.id}`}
          state={state}
          selected={selectedIds.includes(state.student.id)}
          onUpdate={onUpdate}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
