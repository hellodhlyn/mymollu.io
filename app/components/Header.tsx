import { Link, useMatches } from "@remix-run/react"

type HeaderProps = {
  currentUsername: string | null;
};

export default function Header({ currentUsername }: HeaderProps) {
  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;
  return (
    <div className="mt-8 mb-12 md:my-16 text-neutral-900">
      <Link to="/">
        <h1 className="my-6 font-black text-4xl md:text-5xl italic">
          mol<span className="ml-1.5 md:ml-2 pr-2 bg-neutral-900 text-white rounded-lg">lul</span>og
        </h1>
      </Link>
      <div className="flex gap-x-4 text-lg">
        {currentUsername && (
          <>
            <Link to={`/@${currentUsername}`} className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
              <span>내 정보</span>
            </Link>
            <Link to="/futures" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
              <span>미래시</span>
            </Link>
            <Link to={`/edit/students`} className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
              <span>데이터 입력</span>
            </Link>
          </>
        )}
        {(currentUsername === null && !pathname.startsWith("/signin")) && (
          <Link to="/signin">
            <span>로그인 후 내 정보 관리하기 →</span>
          </Link>
        )}
      </div>
    </div>
  );
}
