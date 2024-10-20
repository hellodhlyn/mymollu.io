import { useMatches } from "@remix-run/react";
import { Link } from "iconoir-react";

export default function Footer() {
  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;
  if (pathname === "/signin") {
    return null;
  }

  return (
    <div className="mt-16 py-16">
      <p className="text-lg text-bold font-ingame"><span className="font-bold">
        몰루</span>로그
      </p>

      <p className="my-4 text-sm text-neutral-500">
        몰루로그는 게임 &lt;블루 아카이브&gt;의 팬 사이트로 공식 사이트가 아닙니다.<br />
        &lt;블루 아카이브&gt;의 각종 에셋 및 컨텐츠의 권리는 넥슨코리아, 넥슨게임즈 및 Yostar에 있습니다.
      </p>

      <a href="https://github.com/hellodhlyn/mollulog" target="_blank" rel="noreferrer">
        <div className="flex items-center gap-x-1 hover:opacity-50 transition-opacity">
          <Link className="size-5" />
          <span>GitHub</span>
        </div>
      </a>
    </div>
  );
}
