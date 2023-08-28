import type { V2_MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { ArrowRight } from "iconoir-react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "MyMollu" },
    { name: "description", content: "Share your blue archive specs and get feedbacks from your friends." },
  ];
};

export default function Index() {
  return (
    <div className="p-4">
      <h1 className="my-16 font-black text-4xl">MyMollu</h1>
      <Link to="/edit">
        <div className="my-4 flex items-center text-xl cursor-pointer hover:underline">
          <span>학생부 편집</span>
          <ArrowRight className="h-5 w-5 ml-1" strokeWidth={2} />
        </div>
      </Link>
    </div>
  );
}
