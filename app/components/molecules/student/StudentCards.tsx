import type { StudentCardProps } from "~/components/atoms/student";
import { StudentCard } from "~/components/atoms/student"

type StudentCardsProps = {
  cardProps: StudentCardProps[];
  mobileGrid?: 4 | 5 | 6;
  onSelect?: (id: string) => void;
};

export default function StudentCards({ cardProps, mobileGrid, onSelect }: StudentCardsProps) {
  const selectable = onSelect !== undefined;
  let gridClass = "grid-cols-6";
  if (mobileGrid === 5) {
    gridClass = "grid-cols-5";
  } else if (mobileGrid === 4) {
    gridClass = "grid-cols-4";
  }

  return (
    <div className={`grid ${gridClass} md:grid-cols-8 gap-1 sm:gap-2`}>
      {cardProps.map((prop) => (
        <div
          key={`student-card-${prop.id}${prop.name ? `-${prop.name}` : ""}`}
          className={selectable ? "hover:scale-105 cursor-pointer transition" : ""}
          onClick={() => { if (selectable) { onSelect(prop.id); } } }
        >
          <StudentCard key={`list-students-${prop.id}`} {...prop} />
        </div>
      ))}
    </div>
  );
}
