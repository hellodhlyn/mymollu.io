import { Link, Outlet, useMatches } from "@remix-run/react";
import { Bars3Icon, DocumentDuplicateIcon, HomeIcon, KeyIcon, Squares2X2Icon, UserCircleIcon, UserMinusIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

const navigations = [
  { title: "프로필", to: "/edit/profile", icon: UserCircleIcon },
  { title: "학생 명부", to: "/edit/students", icon: UsersIcon },
  { title: "모집 이력", to: "/edit/pickups", icon: DocumentDuplicateIcon },
  { title: "편성/공략", to: "/edit/parties", icon: Squares2X2Icon },
  { title: "인증/보안", to: "/edit/security", icon: KeyIcon },
];

export default function Edit() {
  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;

  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);

    const content = document?.getElementById("edit-page-contents");
    content?.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="w-screen flex flex-col sm:flex-row">
      {/* Sidebar */}
      <div className="sm:h-screen w-full sm:w-48 md:w-64 shrink-0 p-4 sm:p-6 bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-inner sticky top-0 z-10">
        <div className="flex items-center">
          <div className="flex flex-row sm:flex-col items-center grow">
            <Link to="/">
              <h1 className="hover:opacity-50 transition-opacity text-xl sm:text-2xl font-ingame">
                <span className="font-bold">몰루</span>로그
              </h1>
            </Link>
            <p className="ml-2 sm:ml-0 sm:text-sm">프로필 관리</p>
          </div>
          <Bars3Icon className="sm:hidden size-6" strokeWidth={2} onClick={() => setOpen((prev) => !prev)} />
        </div>

        <div className={`${open ? "h-4" : ""} sm:h-4`} />

        <div className={`${open ? "visible" : "hidden"} sm:block`}>
          {navigations.map(({ title, to, icon: Icon }) => (
            <Link to={to} key={to}>
              <div className={pathname.startsWith(to) ?
                "flex items-center -mx-2 sm:-mr-6 my-2 px-4 py-2 bg-white rounded-lg sm:rounded-r-none sm:rounded-l-lg text-blue-700 font-bold" :
                "flex items-center -mx-2 my-2 px-4 py-2 hover:bg-blue-400 rounded-lg transition"
              }>
                <Icon className="size-5 mr-2" strokeWidth={2} />
                <p>{title}</p>
              </div>
            </Link>
          ))}
          <div className="w-full my-4 border-t border-white opacity-50" />
          <Link to="/">
            <div className="flex items-center -mx-2 my-2 px-4 py-2 hover:bg-blue-400 rounded-lg transition">
              <HomeIcon className="size-5 mr-2" strokeWidth={2} />
              <p>홈으로</p>
            </div>
          </Link>
          <Link to="/signout">
            <div className="flex items-center -mx-2 my-2 px-4 py-2 hover:bg-blue-400 rounded-lg transition">
              <UserMinusIcon className="size-5 mr-2" strokeWidth={2} />
              <p>로그아웃</p>
            </div>
          </Link>
        </div>
        
      </div>

      {/* Contents */}
      <div className="md:h-screen grow px-4 md:px-8 py-4 overflow-scroll" id="edit-page-contents">
        <Outlet />
      </div>
    </div>
  );
}
