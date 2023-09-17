import { StudentCard, StudentCardProps } from "~/components/atoms/student"

type StudentCardsProps = {
  cardProps: StudentCardProps[];
  onSelect?: (id: string) => void;
};

export default function StudentCards({ cardProps, onSelect }: StudentCardsProps) {
  const selectable = onSelect !== undefined;
  return (
    <div className="grid grid-cols-6 md:grid-cols-8 gap-1 sm:gap-2">
      {cardProps.map((prop) => (
        <div
          key={`student-card-${prop.id}`}
          className={selectable ? "hover:scale-105 cursor-pointer transition" : ""}
          onClick={() => { if (selectable) { onSelect(prop.id); } } }
        >
          <StudentCard key={`list-students-${prop.id}`} {...prop} />
        </div>
      ))}
    </div>
  );
}
