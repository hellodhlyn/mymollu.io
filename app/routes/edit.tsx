import { Link, Outlet, useMatches } from "@remix-run/react";
import { Menu } from "iconoir-react";
import { Title } from "~/components/atoms/typography";

function EditLinkItem(
  { to, text, active }: { to: string, text: string, active: boolean },
) {
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

export default function Edit() {
  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;
  return (
    <>
      <Title text="학생부 관리" />
      <div className="flex w-full text-gray-700 items-center gap-x-1">
        <Menu className="mr-2 my-2 h-5 w-5" strokeWidth={2} />
        <EditLinkItem to="/edit/students" text="학생 목록" active={pathname.startsWith("/edit/students")} />
        <EditLinkItem to="/edit/specs" text="성장" active={pathname.startsWith("/edit/specs")} />
      </div>
      <Outlet />
    </>
  );
}
