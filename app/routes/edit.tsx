import { Outlet } from "@remix-run/react";
import { Title } from "~/components/atoms/typography";
import { Navigation } from "~/components/organisms/navigation";

export default function Edit() {
  return (
    <>
      <Title text="학생부 관리" />
      <Navigation links={[
        { to: "/edit/students", text: "모집 학생" },
        { to: "/edit/specs", text: "성장" },
      ]} />
      <Outlet />
    </>
  );
}
