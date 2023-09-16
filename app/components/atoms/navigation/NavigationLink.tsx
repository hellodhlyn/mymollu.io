import { Link } from "@remix-run/react";

type NavigationLinkProps = {
  to: string,
  text: string,
  active: boolean,
};

export default function NavigationLink({ to, text, active }: NavigationLinkProps) {
  return (
    <Link to={to}>
      <span
        className={`
          px-4 py-2 transition rounded-lg
          ${active ?
            "font-bold bg-gradient-to-br from-sky-500 to-fuchsia-500 text-white shadow-lg" :
            "hover:bg-gray-200"
          }
        `}
      >
        {text}
      </span>
    </Link>
  );
}
