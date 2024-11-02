import { PlusCircleIcon } from "@heroicons/react/16/solid";
import { Link } from "@remix-run/react";
import { sanitizeClassName } from "~/prophandlers";

export default function AddContentButton({ text, link }: { text: string, link: string }) {
  return (
    <Link to={link}>
      <div className={sanitizeClassName(`
        my-4 p-4 flex justify-center items-center border border-neutral-200
        rounded-lg text-neutral-500 hover:bg-neutral-100 transition cursor-pointer
      `)}>
        <PlusCircleIcon className="size-4 mr-1" />
        <span>{text}</span>
      </div>
    </Link>
  )
}
