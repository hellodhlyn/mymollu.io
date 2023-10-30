import { HelpCircle } from "iconoir-react";

type ErrorPageProps = {
  message?: string;
};

export default function ErrorPage({ message }: ErrorPageProps) {
  return (
    <div className="my-16 md:my-24 w-full flex flex-col items-center justify-center text-neutral-500">
      <HelpCircle className="my-2 w-16 h-16" strokeWidth={2} />
      <p className="my-2 text-sm">{message ?? "알 수 없는 오류가 발생했어요"}</p>
    </div>
  )
}
