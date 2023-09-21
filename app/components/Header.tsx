import { Link } from "@remix-run/react"

type HeaderProps = {
  currentUsername: string | null;
};

export default function Header({ currentUsername }: HeaderProps) {
  return (
    <div className="my-12 md:my-16">
      <h1 className="my-6 font-black text-5xl italic">
        mollulog
      </h1>
      <div className="flex gap-x-4 text-lg text-gray-700">
        <Link to="/" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
          <span>첫 화면</span>
        </Link>
        {currentUsername ? (
          <>
            <Link to={`/@${currentUsername}`} className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
              <span>내 정보</span>
            </Link>
            <Link to={`/edit/students`} className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
              <span>데이터 입력</span>
            </Link>
          </>
        ) : (
          <Link to="/signin">
            <span>로그인</span>
          </Link>
        )}
      </div>
    </div>
  );
}
