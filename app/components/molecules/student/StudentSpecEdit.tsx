import { useEffect, useState } from "react";
import { EditTier, StudentCard } from "~/components/atoms/student";
import { StudentState } from "~/models/studentState";

type StudentSpecEditProps = {
  initialState: StudentState;
  onUpdate: (state: StudentState) => void;
};

export default function StudentSpecEdit({ initialState, onUpdate }: StudentSpecEditProps) {
  const [state, setState] = useState(initialState);
  useEffect(() => {
    onUpdate(state);
  }, [state]);

  const { student } = initialState;
  return (
    <div className="flex p-1 hover:bg-gray-100 transition items-center">
      <div className="w-16">
        <StudentCard id={student.id} imageUrl={student.imageUrl} />
      </div>
      <div className="mx-4">
        <EditTier
          initialTier={student.initialTier}
          currentTier={initialState.tier ?? student.initialTier}
          onUpdate={(tier) => { setState((prev) => ({ ...prev, tier })); }}
        />
      </div>
    </div>
  );
}
