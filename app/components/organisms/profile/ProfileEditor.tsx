import { disassemble } from "hangul-js";
import { useState } from "react";
import { Input, Button } from "~/components/atoms/form";
import { StudentCards } from "~/components/molecules/student";
import { filterStudentByName } from "~/filters/student";
import { studentImageUrl, type Student } from "~/models/student";

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

    if (disassemble(search).length <= 1) {
      return setSearchedStudents([]);
    }
    setSearchedStudents(filterStudentByName(search, allStudents).slice(0, 6));
  };

  return (
    <>
      <Input
        name="username" label="닉네임" defaultValue={initialData?.username}
        error={error?.username}
        description="4~20글자의 영숫자 및 _ 기호를 이용할 수 있어요."
      />

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
              className="h-12 w-12 mr-4 rounded-full object-cover"
              src={studentImageUrl(profileStudent.id)}
              alt={profileStudent.name}
            />
            <p><span className="font-bold">{profileStudent.name}</span>를 선택했어요.</p>
          </div>
          <input type="hidden" name="profileStudentId" value={profileStudent.id} />
        </>
      )}

      <Button type="submit" text="완료" color="primary" className="my-4" />
    </>
  );
}
