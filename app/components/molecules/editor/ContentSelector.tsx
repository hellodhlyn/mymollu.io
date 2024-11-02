import { ReactNode, useState } from "react";
import { Label } from "~/components/atoms/form";

type ContentProps = {
  contentId: string;
  name: string;
  description: string | ReactNode;
  imageUrl: string | null;
};

type ContentSelectorProps = {
  contents: ContentProps[];
  initialContentId?: string;
  placeholder?: string;
  onSelectContent: (contentId: string) => void;
};

function Content({ name, description, imageUrl }: ContentProps) {
  return (
    <div className="h-full w-full flex">
      <div className="py-2 pl-4 pr-8 h-full grow flex flex-col justify-center rounded-lg">
        <p className="font-bold line-clamp-1">{name}</p>
        <p className="text-xs md:text-sm text-neutral-500">{description}</p>
      </div>
      {imageUrl ? (
        <img
          src={imageUrl} alt={name}
          className="h-full max-w-32 md:max-w-48 aspect-video rounded-r-lg object-cover bg-gradient-to-r from-white to-neutral-300 "
        />
      ) : null}
    </div>
  )
}

export default function ContentSelector({ contents, initialContentId, placeholder, onSelectContent }: ContentSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedContent, setSelected] = useState<ContentSelectorProps["contents"][number] | null>(
    initialContentId ? contents.find((content) => content.contentId === initialContentId) ?? null : null,
  );

  return (
    <>
      <Label text="컨텐츠" />

      <div className="relative">
        <div
          className={`my-4 h-24 w-full md:w-fit rounded-lg shadow-lg hover:opacity-50 cursor-pointer transition-opacity ${open ? "opacity-50" : ""}`}
          onClick={() => setOpen((prev) => !prev)}
        >
          {selectedContent ? <Content {...selectedContent} /> : (
            <div>
              <div className="pl-4 pr-24 h-24 flex flex-col justify-center">
                <p className="text-lg font-bold">컨텐츠 선택</p>
                <p className="text-sm text-neutral-500">{placeholder ?? "컨텐츠를 선택하세요"}</p>
              </div>
            </div>
          )}
        </div>

        {open && (
          <div className="absolute left-0 pb-4 md:pb-64 bg-white z-10">
            <div className="border border-neutral-200 rounded-lg shadow-lg">
              {contents.map((content) => (
                <div
                  key={content.contentId}
                  className="h-24 border-b border-neutral-100 hover:bg-neutral-100 cursor-pointer transition"
                  onClick={() => {
                    onSelectContent(content.contentId);
                    setSelected(content);
                    setOpen(false);
                  }}
                >
                  <Content {...content} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
