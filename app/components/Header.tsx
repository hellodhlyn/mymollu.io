import { Link } from "@remix-run/react"

export default function Header() {
  return (
    <div className="my-16">
      <h1 className="my-6 font-black text-5xl italic">MyMollu</h1>
      <div className="flex gap-x-4 text-lg text-gray-700">
        <Link to="/" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
          <span>처음으로</span>
        </Link>
        <Link to="/edit" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
          <span>학생부 편집</span>
        </Link>
      </div>
    </div>
  );
}
