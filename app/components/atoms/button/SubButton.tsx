type SubButtonProps = {
  Icon: React.ForwardRefExoticComponent<Omit<React.SVGProps<SVGSVGElement>, "ref">>;
  text: string;
  onClick?: () => void;
};

export default function SubButton({ Icon, text, onClick }: SubButtonProps) {
  return (
    <div
      className="inline-flex items-center px-4 py-2 gap-x-1 bg-neutral-200 hover:opacity-75 rounded-lg cursor-pointer transition"
      onClick={onClick}
    >
      <Icon className="size-4" strokeWidth={2} />
      <span>{text}</span>
    </div>
  );
}
