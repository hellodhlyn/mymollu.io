import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

type ErrorPageProps = {
  Icon?: typeof QuestionMarkCircleIcon;
  message?: string;
};

export default function ErrorPage({ Icon, message }: ErrorPageProps) {
  const ShowingIcon = Icon ?? QuestionMarkCircleIcon;
  return (
    <div className="my-16 md:my-24 w-full flex flex-col items-center justify-center text-neutral-400">
      <ShowingIcon className="my-2 w-16 h-16" strokeWidth={2} />
      <p className="my-2 text-sm">{message ?? "알 수 없는 오류가 발생했어요"}</p>
    </div>
  )
}
