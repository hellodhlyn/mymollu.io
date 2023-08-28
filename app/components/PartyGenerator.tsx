import { AddUser } from "iconoir-react";
import { Student } from "~/models/student";

type PartyGeneratorProps = {
  students: (Student | null)[];
  onReset: () => void;
};

export function PartyGenerator({ students, onReset }: PartyGeneratorProps) {
  const selectedCount = students.filter((each) => each !== null).length;
  return (
    <div className="max-w-3xl mx-auto px-6 py-4 bg-white bg-opacity-90 rounded-t-lg shadow-xl">
      <p className="font-bold text-xl my-2">파티 편성</p>
      {selectedCount === 0 ? 
        <p className="my-2 text-sm text-gray-500">학생을 선택하여 파티를 편성하세요.</p> :
        <div className="my-4 grid grid-cols-6 md:grid-cols-10 gap-1 gap-2">
          {students.map((student) => (
            <div id={`partyGen-${student?.id ?? "null"}`}>
              {student ?
                <img className="rounded-lg" src={student.imageUrl} alt={student.name} /> :
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
          <button
            className="px-4 py-2 bg-red-500 rounded-lg text-white shadow-lg shadow-red-300"
            onClick={onReset}
          >
            초기화
          </button>
        </div>
      )}
      {selectedCount == 6 && (
        <div className="my-2 grid grid-cols-4 md:grid-cols-6 gap-2">
          <input type="text" name="name" className="col-span-2 md:col-span-4 p-2 border rounded-lg" placeholder="파티 이름" />
          <button
            className="px-4 py-2 bg-red-500 rounded-lg text-white shadow-lg shadow-red-300"
            onClick={onReset}
          >
            초기화
          </button>
          <button className="x-4 py-2 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-300">저장</button>
        </div>
      )}
    </div>
  );
};
