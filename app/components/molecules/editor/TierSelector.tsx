import { Menu } from "@headlessui/react";
import { Star } from "iconoir-react";
import { SmallButton } from "~/components/atoms/form";

function Stars({ tier }: { tier: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5, 6, 7, 8].filter((position) => position <= tier).map((position) => (
        <span
          key={`star-${position}-of-${tier}`}
          className={`
            cursor-pointer transition ${position === 6 ? "ml-2" : ""}
            ${position >= 6 ? "text-teal-500" : "text-yellow-500"}
          `}
        >
          ★
        </span>
      ))}
    </div>
  );
}

type TierSelectorProps = {
  text?: string;
  onSelect: (tier: number) => void;
};

export default function TierSelector({ text, onSelect }: TierSelectorProps) {
  return (
    <Menu as="div" className="relative">
      {({ close }) => (
        <>
          <Menu.Button>
            <SmallButton>
              <Star className="mr-1 w-4 h-4" strokeWidth={2} />
              <span>{text ?? "성장"}</span>
            </SmallButton>
          </Menu.Button>
          <Menu.Items className="absolute origin-top-left bg-white rounded-lg shadow-lg border border-gray-100">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((tier) => (
              <Menu.Item
                as="div" key={`apply-tier-${tier}`}
                className="px-2 py-1 hover:bg-gray-100 transition rounded-lg cursor-pointer"
                onClick={() => { onSelect(tier); close(); }}
              >
                <Stars tier={tier} />
              </Menu.Item>
            ))}
          </Menu.Items>
        </>
      )}
    </Menu>
  );
}
