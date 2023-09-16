type ButtonProps = {
  text: string;
  type?: "button" | "submit" | "reset";
  color?: "primary" | "white";
  onClick?: () => {};
};

export default function Button({ text, type, color, onClick }: ButtonProps) {
  let className = "";
  if (color === "primary") {
    className = "bg-blue-500 hover:bg-blue-400 shadow-blue-300 text-white"
  } else {
    className = "bg-white hover:bg-gray-50 border";
  }

  return (
    <button
      type={type || "button"}
      className={`inline-block my-1 mr-1 md:mr-2 px-4 py-2 rounded-lg shadow-lg transition ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
