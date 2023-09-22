export default function Title({ text, className }: { text: string, className?: string }) {
  return (
    <div className={`my-8 ${className ?? ""}`}>
      <h1 className="text-neutral-900 font-black text-3xl md:text-4xl">{text}</h1>
    </div>
  );
}
