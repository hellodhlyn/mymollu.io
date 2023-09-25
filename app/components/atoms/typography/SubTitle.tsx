export default function SubTitle({ text, className }: { text: string, className?: string }) {
  return (
    <div className={`my-4 text-neutral-900 font-bold text-xl ${className ?? ""}`}>
      <p>{text}</p>
    </div>
  );
}
