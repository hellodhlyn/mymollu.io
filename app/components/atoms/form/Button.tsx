import { ReactNode } from "react";

export type ButtonProps = {
  text?: string;
  children?: ReactNode | ReactNode[];

  type?: "button" | "submit" | "reset";
  color?: "primary" | "red" | "white";
  onClick?: () => void;
};

export default function Button({ text, children, type, color, onClick }: ButtonProps) {
  let className = "";
  if (color === "primary") {
    className = "bg-blue-500 hover:bg-blue-400 shadow-blue-300 dark:shadow-blue-700 text-white"
  } else if (color === "red") {
    className = "bg-red-500 hover:bg-red-400 shadow-red-300 dark:shadow-red-700 text-white"
  } else {
    className = "bg-white hover:bg-gray-50 border";
  }

  return (
    <button
      type={type || "button"}
      className={`inline-block my-1 mr-1 md:mr-2 last:mr-0 px-4 py-2 rounded-lg shadow-lg transition whitespace-nowrap ${className}`}
      onClick={onClick}
    >
      {children ?? text}
    </button>
  );
}
