import { ChatLines } from "iconoir-react";

type MemoEditorProps = {
  initialText?: string;
  placeholder?: string;
  onUpdate: (text: string) => void;
};

export default function MemoEditor({ initialText, placeholder, onUpdate }: MemoEditorProps) {
  return (
    <div className="flex p-2 my-4 text-sm items-center bg-neutral-100 rounded-lg ">
      <div className="text-neutral-500">
        <ChatLines className="mr-2 w-4 h-4" strokeWidth={2} />
      </div>
      <input
        className="flex-grow bg-neutral-100"
        placeholder={placeholder ?? "메모를 남겨보세요"}
        defaultValue={initialText}
        onKeyUp={(e) => onUpdate(e.currentTarget.value)}
      />
    </div>
  );
}
