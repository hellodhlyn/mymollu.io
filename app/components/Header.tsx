import { Link } from "@remix-run/react"

type HeaderProps = {
  currentUsername: string | null;
};

export default function Header({ currentUsername }: HeaderProps) {
  return (
    <div className="my-16">
      <h1 className="my-6 font-black text-5xl italic">MyMollu</h1>
      <div className="flex gap-x-4 text-lg text-gray-700">
        <Link to="/" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
          <span>처음으로</span>
        </Link>
        {currentUsername ? (
          <>
            <Link to={`/@${currentUsername}`} className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
              <span>나의 학생부</span>
            </Link>
            <Link to={`/edit/students`} className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
              <span>학생부 관리</span>
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
