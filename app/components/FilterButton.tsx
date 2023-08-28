import { Star } from "iconoir-react";

export default function FilterButton({ active, label, onActivate }: { active: boolean, label: string, onActivate: (activated: boolean) => void }) {
  return (
    <div
      className={`
        w-fit flex items-center mr-2 px-2 py-1 border border-gray-300 rounded-xl shadow-lg cursor-pointer
        ${active ? "bg-blue-500 text-white" : ""}
      `}
      onClick={() => onActivate(!active)}
    >
      <Star className="h-4 w-4 mr-1" strokeWidth={2} /> {label}
    </div>
  );
}
