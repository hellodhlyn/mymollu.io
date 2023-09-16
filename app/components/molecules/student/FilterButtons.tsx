import { Filter, FilterList } from "iconoir-react";
import { useEffect, useState } from "react";

// === FilterButton
type FilterButtonProps = {
  text: string;
  color?: string;
  onToggle: (activated: boolean) => void;
};

function FilterButton({ text, onToggle, color }: FilterButtonProps) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    onToggle(active);
  }, [active]);

  return (
    <div
      className={`
        inline-block w-fit flex items-center mr-1 px-2 py-1 border border-gray-300 rounded-xl shadow-lg cursor-pointer
        ${active ? `${color || "bg-blue-500"} text-white` : ""}
      `}
      onClick={() => { setActive((prev) => !prev) }}
    >
      {text}
    </div>
  );
}

// === FilterButtons
type FilterButtonsProps = {
  Icon?: typeof FilterList,
  buttonProps: FilterButtonProps[],
}

export default function FilterButtons({ Icon, buttonProps }: FilterButtonsProps) {
  const IconElem = Icon || FilterList;
  return (
    <div className="my-2 flex items-center">
      <IconElem className="h-5 w-5 mr-2" strokeWidth={2} />
      {buttonProps.map((prop) => (<FilterButton key={`filter-${prop.text}`} {...prop} />))}
    </div>
  );
}
