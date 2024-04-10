import { Menu } from "@headlessui/react";
import dayjs from "dayjs";
import { PlusCircle } from "iconoir-react";
import { useState } from "react";
import { Label } from "~/components/atoms/form";
import type { RaidEvent } from "~/models/raid";
import { bossImageUrl, raidTerrainText, raidTypeText } from "~/models/raid"
import { sanitizeClassName } from "~/prophandlers";

type EventSelectorProps = {
  raids: RaidEvent[];
  initialRaidId?: string;
  onSelectRaid(id: string): void;
};

function raidDescription(raid: RaidEvent): string {
  return [
    dayjs(raid.since).format("YYYY-MM-DD"),
    raidTypeText(raid.type),
    raid.terrain ? raidTerrainText(raid.terrain) : null,
  ].filter((text) => text).join(" | ");
}

export default function EventSelector({ raids, initialRaidId, onSelectRaid }: EventSelectorProps) {
  const [selectedRaid, setSelectedRaid] = useState<RaidEvent | undefined>(
    raids.find((raid) => raid.id === initialRaidId),
  );

  const now = dayjs();
  return (
    <div className="mt-4 mb-8 last:mb-4 mr-1 md:mr-2">
      <Label text="목표 컨텐츠" />

      <Menu as="div" className="relative">
        {({ close }) => (
          <>
            <Menu.Button>
              {selectedRaid ?
                <EventSelectorItem
                  name={selectedRaid.name}
                  description={raidDescription(selectedRaid)}
                  imageUrl={bossImageUrl(selectedRaid.boss)}
                  singleCard={true}
                /> :
                <EventSelectorItem
                  name="컨텐츠 선택"
                  description="편성을 사용할 컨텐츠를 선택하세요"
                  singleCard={true}
                />
              }
            </Menu.Button>
            <Menu.Items className="absolute origin-top-left max-h-96 overflow-auto my-2 bg-white rounded-lg shadow-lg border border-neutral-200 z-10">
              {raids.filter((raid) => dayjs(raid.until).isAfter(now)).map((raid) => (
                <EventSelectorItem
                  key={raid.id}
                  name={raid.name}
                  description={raidDescription(raid)}
                  imageUrl={bossImageUrl(raid.boss)}
                  onSelect={() => {
                    setSelectedRaid(raid);
                    onSelectRaid(raid.id);
                    close();
                  }}
                />
              ))}
            </Menu.Items>
          </>
        )}
      </Menu>
    </div>
  );
}

type EventSelectorItemProps = {
  name: string;
  description?: string;
  imageUrl?: string;
  singleCard?: boolean;
  onSelect?: () => void;
}

function EventSelectorItem(
  { imageUrl, name, description, singleCard, onSelect }: EventSelectorItemProps,
) {
  return (
    <div
      className={sanitizeClassName(`
        my-1 relative flex items-center hover:bg-neutral-100 cursor-pointer transition
        ${singleCard ? "border border-neutral-200 rounded-lg shadow-lg" : ""}
      `)}
      onClick={onSelect}
    >
      {imageUrl ?
        <img className={`w-28 md:w-36 h-20 object-cover ${singleCard ? "rounded-l-lg" : ""}`} src={imageUrl} alt={`${name} 이벤트`} /> :
        <div className="w-28 md:w-36 h-20 bg-neutral-200 flex items-center justify-center rounded-l-lg">
          <PlusCircle className="h-8 w-8 text-neutral-500" strokeWidth={2} />
        </div>
      }
      <div className="px-4 text-left">
        <p className="font-bold">{name}</p>
        {description && <p className="my-1 text-xs text-neutral-500">{description}</p>}
      </div>
    </div>
  );
}
