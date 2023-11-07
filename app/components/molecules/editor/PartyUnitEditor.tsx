import { disassemble } from "hangul-js";
import { UserPlus, ChatBubbleXmark, Search } from "iconoir-react";
import { useState } from "react";
import { Label } from "~/components/atoms/form";
import { StudentCard } from "~/components/atoms/student";
import { StudentCards } from "~/components/molecules/student";
import type { StudentState } from "~/models/studentState";

type PartyUnitEditorProps = {
  index: number;
  studentStates: StudentState[];
  onComplete(studentIds: string[]): void;
  onCancel(): void;
};

export default function PartyUnitEditor(
  { index, studentStates, onComplete, onCancel }: PartyUnitEditorProps,
) {
  const [filteredStates, setFilteredStates] = useState<StudentState[]>(studentStates);
  const [unitStudents, setUnitStudents] = useState<(StudentState | null)[]>(new Array(6).fill(null));

  const [error, setError] = useState<string | null>(null);

  const onSearch = (search: string) => {
    if (search.length === 0) {
      return setFilteredStates(studentStates);
    }

    const disassembledSearch = disassemble(search).join();
    setFilteredStates(studentStates.filter((state) => (
      disassemble(state.student.name).join().includes(disassembledSearch)
    )));
  };

  const addPartyStudent = (id: string) => {
    const state = studentStates.find((state) => state.student.id === id);
    if (!state) {
      return;
    }

    // 학생은 최대 6명까지 편성 가능하며, 중복 편성 불가능
    if (unitStudents.find((state) => state?.student.id === id)) {
      return setError("학생은 중복해서 편성할 수 없어요.");
    }
    if (unitStudents.filter((each) => each !== null).length >= 6) {
      return setError("학생은 최대 6명까지만 편성할 수 있어요.");
    }

    const { student } = state;
    if (student.role === "striker") {
      // 스트라이커는 최대 4명까지 편성 가능하며 항상 앞의 4자리를 차지
      const emptyIndex = unitStudents.indexOf(null);
      if (emptyIndex >= 4) {
        return setError("스트라이커 학생은 최대 4명까지 편성할 수 있어요.");
      }

      setUnitStudents((prev) => {
        const newPartyStudents = [...prev];
        newPartyStudents[emptyIndex] = state;
        return newPartyStudents;
      });
    } else {
      // 스페셜은 최대 2명까지 편성 가능하며 항상 뒤의 2자리를 차지
      if (unitStudents[4] !== null && unitStudents[5] !== null) {
        return setError("스페셜 학생은 최대 2명까지 편성할 수 있어요.");
      }

      setError(null);
      setUnitStudents((prev) => {
        const newPartyStudents = [...prev];
        newPartyStudents[prev[4] == null ? 4 : 5] = state;
        return newPartyStudents;
      });
    }
  };

  const completable = (unitStudents.filter((state) => state !== null).length === 6);

  return (
    <>
      <Label text={`${index + 1}번째 파티`} />
      <div className="mt-4 p-4 flex items-center border border-neutral-200 bg-neutral-100 rounded-t-lg">
        <Search className="h-4 w-4 mr-2" strokeWidth={2} />
        <input
          className="w-full bg-neutral-100"
          placeholder="이름으로 찾기..."
          onChange={(e) => onSearch(e.currentTarget.value)}
        />
      </div>

      <div className="max-h-64 md:max-h-80 overflow-auto p-4 bg-neutral-100
                      border-l border-r border-neutral-200">
        {filteredStates.length > 0 ?
          <StudentCards
            cardProps={filteredStates.map(({ student, owned, tier }) => ({
              id: student.id,
              imageUrl: student.imageUrl,
              name: student.name,
              tier: owned ? tier : undefined,
            }))}
            onSelect={addPartyStudent}
          /> :
          <div className="w-full h-64 md:h-80 flex flex-col items-center justify-center text-neutral-500">
            <ChatBubbleXmark className="my-2 w-16 h-16" strokeWidth={2} />
            <p className="my-2 text-sm">검색 결과가 없어요</p>
          </div>
        }
      </div>

      <div className="p-4 border border-neutral-200 bg-neutral-100 rounded-b-lg">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Label text="선택한 학생" />
        {unitStudents.find((state) => state !== null) ?
          <div className="grid grid-cols-6 md:grid-cols-12 gap-1 gap-2">
            {unitStudents.map((state, index) => (
              <div
                key={`partyGen-${state?.student?.id ?? index}`}
                className="bg-neutral-100 rounded-lg"
              >
                {state?.student ?
                  <StudentCard
                    id={state.student.id}
                    imageUrl={state.student.imageUrl}
                    tier={state.owned ? state.tier : undefined}
                  /> :
                  <div className="w-full h-full flex items-center justify-center">
                    <UserPlus />
                  </div>
                }
              </div>
            ))}
          </div> :
          <p className="my-4 text-center text-sm text-neutral-500">파티에 추가할 학생을 선택하세요</p>
        }
        <div className="flex justify-end">
          <button
            type="button"
            className="py-2 px-4 hover:bg-neutral-100 text-red-500 font-bold transition rounded-lg"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className={`py-2 px-4 hover:bg-neutral-100 font-bold transition rounded-lg transition
                        ${completable ? "text-blue-500" : "text-neutral-300"}`}
            onClick={() => {
              if (completable) {
                onComplete(unitStudents.map((state) => state!.student.id));
              }
            }}
          >
            완료
          </button>
        </div>
      </div>
    </>
  );
}
