import { StudentSpecEdit } from "~/components/molecules/student";
import { StudentState } from "~/models/studentState";

type SpecEditorProps = {
  initialStates: StudentState[];
  onUpdate: (state: StudentState) => void;
}

export default function SpecEditor({ initialStates, onUpdate }: SpecEditorProps) {
  return (
    <div className="my-8">
      {initialStates.map((state) => (
        <StudentSpecEdit initialState={state} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
