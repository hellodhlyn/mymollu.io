import type { ButtonProps } from "./Button";

export default function SmallButton({ text, children, color, onClick }: ButtonProps) {
  let colorClass = "";
  if (color === "primary") {
    colorClass = "";
  } else {  // "white"
    colorClass = "bg-white hover:bg-gray-100 border border-gray-100";
  }

  return (
    <div
      className={`
        inline-block w-fit flex items-center my-1 mr-1 px-3 py-1 ${colorClass}
        rounded-xl shadow-lg cursor-pointer transition
      `}
      onClick={onClick}
    >
      {children ?? text}
    </div>
  );
}
