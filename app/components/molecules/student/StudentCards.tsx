import type { StudentCardProps } from "~/components/atoms/student";
import { StudentCard } from "~/components/atoms/student"

type StudentCardsProps = {
  cardProps: StudentCardProps[];
  mobileGrid?: 4 | 5 | 6 | 8;
  pcGrid?: 8 | 12;
  onSelect?: (id: string | null) => void;
};

export default function StudentCards({ cardProps, mobileGrid, pcGrid, onSelect }: StudentCardsProps) {
  const selectable = onSelect !== undefined;
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
      {cardProps.map((prop) => (
        <div
          key={`student-card-${prop.studentId}${prop.name ? `-${prop.name}` : ""}`}
          className={selectable ? "hover:scale-105 cursor-pointer transition" : ""}
          onClick={() => { if (selectable) { onSelect(prop.studentId); } } }
        >
          <StudentCard key={`list-students-${prop.studentId}`} {...prop} />
        </div>
      ))}
    </div>
  );
}
