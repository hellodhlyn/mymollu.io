import { useMatches } from "@remix-run/react";
import { Menu } from "iconoir-react";
import { NavigationLink } from "~/components/atoms/navigation";

type NavigationProps = {
  links: { to: string, text: string }[];
}

export default function Navigation({ links }: NavigationProps) {
  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;
  return (
    <div className="flex w-full text-gray-700 items-center gap-x-1">
      <Menu className="mr-2 my-2 h-5 w-5" strokeWidth={2} />
      {links.map(({ to, text }) => (
        <NavigationLink key={`nav-${to}`} to={to} text={text} active={pathname.startsWith(to)} />
      ))}
    </div>
  );
}
