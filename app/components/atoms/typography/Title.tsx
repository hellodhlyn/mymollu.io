export default function Title({ text }: { text: string }) {
  return (
    <div className="mt-12 mb-8">
      <h1 className="font-black text-4xl">{text}</h1>
    </div>
  );
}
