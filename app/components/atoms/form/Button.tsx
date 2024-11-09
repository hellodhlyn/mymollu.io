import type { ReactNode } from "react";

export type ButtonProps = {
  text?: string;
  className?: string;
  children?: ReactNode | ReactNode[];

  type?: "button" | "submit" | "reset";
  color?: "primary" | "red" | "white" | "black";
  onClick?: () => void;
  disabled?: boolean;
};

export default function Button({ text, className, children, type, color, onClick, disabled }: ButtonProps) {
  let colorClass = "";
  if (color === "primary") {
    colorClass = "bg-blue-500 enabled:hover:bg-blue-400 disabled:bg-blue-300 text-white"
  } else if (color === "red") {
    colorClass = "bg-red-500 enabled:hover:bg-red-400 disabled:bg-red-300 text-white"
  } else if (color === "black") {
    colorClass = "bg-neutral-900 enabled:hover:bg-neutral-700 disabled:bg-neutral-500 text-white";
  } else {
    colorClass = "bg-white hover:bg-gray-50 border";
  }

  return (
    <button
      type={type || "button"}
      className={`inline-block my-2 px-4 py-2 rounded-xl transition ${colorClass} ${className ?? ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children ?? text}
    </button>
  );
}
