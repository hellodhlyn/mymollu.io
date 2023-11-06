import { CloudUpload, RefreshDouble } from "iconoir-react";
import { sanitizeClassName } from "~/prophandlers";

export default function FloatingButton({ state }: { state: "idle" | "submitting" | "loading" }) {
  let icon;
  if (state === "idle") {
    icon = <CloudUpload className="h-4 w-4 mr-2" strokeWidth={2} />;
  } else {
    icon = <RefreshDouble className="h-4 w-4 mr-2 animate-spin" strokeWidth={2} />;
  }

  return (
    <button
      className={sanitizeClassName(`
        m-4 md:m-8 px-4 py-2 fixed bottom-0 right-0 flex items-center bg-blue-500 hover:bg-blue-400 disabled:bg-neutral-300
        text-white shadow-xl rounded-full transition cursor-pointer disabled:cursor-default
      `)}
      disabled={state !== "idle"}
    >
      {icon}
      <span>{state === "idle" ? "저장" : "저장중..."}</span>
    </button>
  );
}
