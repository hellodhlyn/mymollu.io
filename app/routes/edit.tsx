import { Outlet } from "@remix-run/react";
import { Title } from "~/components/atoms/typography";
import { Navigation } from "~/components/organisms/navigation";

export default function Edit() {
  return (
    <>
      <Title text="데이터 입력" />
      <Navigation links={[
        { to: "/edit/profile", text: "프로필" },
        { to: "/edit/students", text: "학생" },
        { to: "/edit/specs", text: "성장" },
        { to: "/edit/new-parties", text: "편성 만들기" },
        { to: "/edit/parties", text: "기존 편성" },
        { to: "/signout", text: "로그아웃" },
      ]} />
      <Outlet />
    </>
  );
}
