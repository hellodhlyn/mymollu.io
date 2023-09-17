import { AddUser } from "iconoir-react";
import { useEffect, useState } from "react";
import { Button, Input } from "~/components/atoms/form";
import { StudentCard } from "~/components/atoms/student";
import { SubTitle } from "~/components/atoms/typography";
import { StudentState } from "~/models/studentState";

type PartyEditorProps = {
  states: (StudentState | null)[];
  errorMessage: string | null;
  onErrorDisappear: () => void;
  onReset: () => void;
};

export default function PartyEditor(
  { states, errorMessage, onErrorDisappear, onReset }: PartyEditorProps,
) {
  const [errorTimers, setErrorTimers] = useState<NodeJS.Timeout[]>();
  const [showError, setShowError] = useState(false);
  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    if (errorTimers) {
      errorTimers.forEach(clearTimeout);
    }

    setShowError(true);
    setErrorTimers([
      setTimeout(() => { setShowError(false); }, 4000),
      setTimeout(() => { onErrorDisappear(); setErrorTimers(undefined) }, 5000),
    ]);
  }, [errorMessage]);

  const selectedCount = states.filter((each) => each !== null).length;
  return (
    <div className="dark max-w-3xl mx-auto text-white">
      {errorMessage && (
        <div 
          className={`
            mx-2 md:mx-0 mb-4 px-6 md:px-8 py-4 bg-red-600 opacity-95 rounded-lg shadow-lg
            ${showError ? "opacity-100" : "opacity-0"} transition
          `}
        >
          {errorMessage}
        </div>
      )}
      <div className="px-6 md:px-8 py-2 md:py-4 bg-neutral-900 bg-opacity-95 rounded-t-lg shadow-lg">
        <SubTitle text="편성한 학생" />
        {selectedCount === 0 ?
          <p className="my-4 text-sm text-neutral-300">학생을 선택하여 편성하세요.</p> :
          <div className="my-4 grid grid-cols-6 md:grid-cols-10 gap-1 gap-2">
            {states.map((state, index) => (
              <div key={`partyGen-${state?.student?.id ?? index}`}>
                {state?.student ?
                  <StudentCard
                    id={state.student.id}
                    imageUrl={state.student.imageUrl}
                  /> :
                  <div className="w-full h-full flex items-center justify-center">
                    <AddUser />
                  </div>
                }
              </div>
            ))}
          </div>
        }
        {(selectedCount > 0 && selectedCount < 6) && (
          <div className="my-2 flex justify-end">
            <Button type="button" color="red" text="초기화" onClick={onReset} />
          </div>
        )}
        {selectedCount == 6 && (
          <div className="my-2 flex justify-end text-sm md:text-base">
            <Input name="name" placeholder="편성 이름" className="flex-grow" />
            <Button type="button" color="red" text="초기화" onClick={onReset} />
            <Button type="submit" color="primary" text="저장" />
          </div>
        )}
      </div>
    </div>
  );
};
