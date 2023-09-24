export default function SubTitle({ text, className }: { text: string, className?: string }) {
  return (
    <div className={`my-4 ${className ?? ""}`}>
      <h1 className="text-neutral-900 font-bold text-xl">{text}</h1>
    </div>
  );
}
