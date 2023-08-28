type FilterButtonProps = {
  active: boolean;
  label: string;
  onActivate: (activated: boolean) => void;
  color?: string;
};

export default function FilterButton({ active, label, onActivate, color }: FilterButtonProps) {
  return (
    <div
      className={`
        inline-block w-fit flex items-center mr-1 px-2 py-1 border border-gray-300 rounded-xl shadow-lg cursor-pointer
        ${active ? `${color || "bg-blue-500"} text-white` : ""}
      `}
      onClick={() => onActivate(!active)}
    >
      {label}
    </div>
  );
}
