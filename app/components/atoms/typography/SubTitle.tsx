export default function SubTitle({ text, className }: { text: string, className?: string }) {
  return (
    <p className={`first-of-type:mt-4 mt-8 mb-4 font-bold text-xl ${className ?? ""}`}>{text}</p>
  );
}
