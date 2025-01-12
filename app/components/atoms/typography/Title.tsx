export default function Title({ text, className }: { text: string, className?: string }) {
  return (
    <h1 className={`first:mt-4 mt-8 mb-4 font-black text-3xl md:text-4xl ${className ?? ""}`}>
      {text}
    </h1>
  );
}
