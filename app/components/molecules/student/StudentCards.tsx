import type { StudentCardProps } from "~/components/atoms/student";
import { StudentCard } from "~/components/atoms/student"
import StudentInfo from "./StudentInfo";
import { ReactNode, useState } from "react";
import type { AttackType, DefenseType, Role } from "~/models/content";

type StudentCardsProps = {
  // @deprecated - use `students` instead
  cardProps?: StudentCardProps[];

  students?: {
    studentId: string | null;
    name: string;
    attackType?: AttackType;
    defenseType?: DefenseType;
    role?: Role;
    schaleDbId?: string;

    tier?: number | null;
    label?: ReactNode;
    grayscale?: boolean;

    state?: {
      selected?: boolean;
    };
  }[];
  mobileGrid?: 4 | 5 | 6 | 8;
  pcGrid?: 8 | 12;
  onSelect?: (id: string | null) => void;
};

export default function StudentCards({ cardProps, students, mobileGrid, pcGrid, onSelect }: StudentCardsProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  let gridClass = "grid-cols-6";
  if (mobileGrid === 8) {
    gridClass = "grid-cols-8";
  } else if (mobileGrid === 5) {
    gridClass = "grid-cols-5";
  } else if (mobileGrid === 4) {
    gridClass = "grid-cols-4";
  }

  let pcGridClass = "md:grid-cols-8"
  if (pcGrid === 12) {
    pcGridClass = "md:grid-cols-12";
  }

  return (
    <div className={`grid ${gridClass} ${pcGridClass} gap-1 sm:gap-2`}>
      {students && students.map((student) => {
        const { studentId, name } = student;
        return (
          <div key={`student-card-${name}`}>
            <div
              className={(onSelect && studentId) ? "hover:scale-105 cursor-pointer transition" : ""}
              onClick={studentId ? () => {
                onSelect?.(studentId);
                setSelectedStudentId(studentId);
              } : undefined}
            >
              <StudentCard {...student} selected={student?.state?.selected} />
            </div>

            {(selectedStudentId === studentId && student.attackType && student.defenseType && student.role && student.schaleDbId) && (
              <StudentInfo
                student={{
                  name,
                  attackType: student.attackType!,
                  defenseType: student.defenseType!,
                  role: student.role!,
                  schaleDbId: student.schaleDbId!,
                }}
                favorited={student?.state?.selected ?? false}
                onRemoveFavorite={() => { onSelect?.(studentId); }}
                onAddFavorite={() => { onSelect?.(studentId); }}
                onClose={() => { setSelectedStudentId(null); }}
              />
            )}
          </div>
        );
      })}

      {/* DEPRECATED */}
      {(!students || students.length === 0) && cardProps?.map((prop) => (
        <div
          key={`student-card-${prop.studentId}${prop.name ? `-${prop.name}` : ""}`}
          className={(onSelect && prop.studentId) ? "hover:scale-105 cursor-pointer transition" : ""}
          onClick={() => onSelect?.(prop.studentId)}
        >
          <StudentCard key={`list-students-${prop.studentId}`} {...prop} />
        </div>
      ))}
    </div>
  );
}
