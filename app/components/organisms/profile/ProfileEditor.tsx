import { disassemble } from "hangul-js";
import { useState } from "react";
import { Input, Button } from "~/components/atoms/form";
import { StudentCards } from "~/components/molecules/student";
import { Student } from "~/models/student";

type ProfileEditorProps = {
  allStudents: Student[];
  initialData?: {
    username: string;
    profileStudentId: string | null;
  };
  error?: {
    username?: string;
  };
}

export default function ProfileEditor({ allStudents, initialData, error }: ProfileEditorProps) {
  const [searchedStudents, setSearchedStudents] = useState<Student[]>([]);
  const [profileStudent, setProfileStudent] = useState<Student | null>(
    initialData?.profileStudentId ? allStudents.find(({ id }) => initialData.profileStudentId === id) ?? null : null
  );

  const onSearch = (search: string) => {
    if (search.length === 0) {
      return setSearchedStudents([]);
    }

    const disassembledSearch = disassemble(search).join();
    if (disassembledSearch.length <= 1) {
      return setSearchedStudents([]);
    }

    setSearchedStudents(allStudents.filter((student) => (
      disassemble(student.name).join().includes(disassembledSearch)
    )).slice(0, 6));
  };

  return (
    <>
      <Input
        label="프로필 아이콘"
        placeholder="이름으로 찾기..."
        description="학생을 프로필 아이콘으로 선택할 수 있어요."
        onChange={onSearch}
      />
      {(searchedStudents && searchedStudents.length > 0) && (
        <StudentCards
          cardProps={searchedStudents}
          onSelect={(id) => {
            setProfileStudent(allStudents.find((student) => student.id === id)!);
            setSearchedStudents([]);
          }}
        />
      )}
      {profileStudent && (
        <>
          <div className="my-8 flex items-center px-4 py-2 bg-neutral-100 rounded-lg">
            <img
              className="h-12 w-12 mr-4 rounded-full"
              src={profileStudent.imageUrl} alt={profileStudent.name}
            />
            <p><span className="font-bold">{profileStudent.name}</span>를 선택했어요.</p>
          </div>
          <input type="hidden" name="profileStudentId" value={profileStudent.id} />
        </>
      )}

      <Input
        name="username" label="닉네임" defaultValue={initialData?.username}
        error={error?.username}
        placeholder="영숫자 및 _ 기호 (4~20글자)"
        description={initialData?.username ?
          "4~20글자의 영숫자 및 _ 기호를 이용할 수 있어요." :
          "기존에 임시 로그인을 사용한 경우, 해당 아이디와 동일하게 입력해주세요."
        }
      />
      <Button type="submit" text="완료" color="primary" className="my-4" />
    </>
  );
}
