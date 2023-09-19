export default function Title({ text, className }: { text: string, className?: string }) {
  return (
    <div className={`my-8 ${className ?? ""}`}>
      <h1 className="font-black text-4xl">{text}</h1>
    </div>
  );
}
