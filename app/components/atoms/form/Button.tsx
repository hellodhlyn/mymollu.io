import type { ReactNode } from "react";

export type ButtonProps = {
  text?: string;
  className?: string;
  children?: ReactNode | ReactNode[];

  type?: "button" | "submit" | "reset";
  color?: "primary" | "red" | "white";
  onClick?: () => void;
  disabled?: boolean;
};

export default function Button({ text, className, children, type, color, onClick, disabled }: ButtonProps) {
  let colorClass = "";
  if (color === "primary") {
    colorClass = "bg-blue-500 hover:bg-blue-400 shadow-blue-300 disabled:bg-blue-300 text-white"
  } else if (color === "red") {
    colorClass = "bg-red-500 hover:bg-red-400 shadow-red-300 disabled:shadow-red-300 text-white"
  } else {
    colorClass = "bg-white hover:bg-gray-50 border";
  }

  return (
    <button
      type={type || "button"}
      className={`
        inline-block mt-4 mb-8 mr-1 md:mr-2 last:mr-0 px-4 py-2 rounded-lg shadow-lg
        transition whitespace-nowrap ${colorClass} ${className ?? ""}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children ?? text}
    </button>
  );
}
