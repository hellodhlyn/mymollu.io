import type { ButtonProps } from "./Button";

export default function SmallButton({ type, text, children, color, onClick }: ButtonProps) {
  let colorClass = "";
  if (color === "primary") {
    colorClass = "";
  } else if (color === "red") {
    colorClass = "bg-red-500 hover:bg-red-400 shadow-red-300 dark:shadow-red-700 text-white"
  } else {  // "white"
    colorClass = "bg-white hover:bg-gray-100 border border-gray-100";
  }

  return (
    <button
      type={type ?? "button"}
      className={`
        inline-block w-fit flex items-center my-1 mr-1 px-3 py-1 ${colorClass}
        rounded-lg shadow-lg cursor-pointer transition
      `}
      onClick={onClick}
    >
      {children ?? text}
    </button>
  );
}
