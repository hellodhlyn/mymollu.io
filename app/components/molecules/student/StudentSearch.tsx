import { useState } from "react";
import { Input } from "~/components/atoms/form";
import StudentCards from "./StudentCards";
import { filterStudentByName } from "~/filters/student";

type SearchableStudent = {
  studentId: string;
  name: string;
};

type StudentSearchProps = {
  label?: string;
  placeholder?: string;
  description?: string;

  students: SearchableStudent[];
  onSelect: (studentId: string) => void;
};

export default function StudentSearch(
  { label, placeholder, description, students, onSelect }: StudentSearchProps,
) {
  const [searched, setSearched] = useState<SearchableStudent[]>([]);

  const onSearch = (search: string) => {
    if (search.length === 0) {
      return setSearched([]);
    }
    setSearched(filterStudentByName(search, students, 6));
  };

  return (
    <>
      <div>
        <Input label={label} placeholder={placeholder} description={description} onChange={onSearch} />
      </div>
      {(searched && searched.length > 0) && (
        <StudentCards
          students={searched}
          onSelect={(studentId) => {
            studentId && onSelect(studentId);
            setSearched([]);
          }}
        />
      )}
    </>
  );
}
