import { ReactNode } from "react";

export type StudentCardProps = {
  id: string;
  imageUrl: string;
  name?: string;

  tier?: number | null;
  label?: ReactNode;

  selected?: boolean;
  grayscale?: boolean;
}

function visibileTier(tier: number): [number, boolean] {
  if (tier <= 5) {
    return [tier, false];
  } else {
    return [tier - 5, true];
  }
}

export default function StudentCard(
  { name, imageUrl, tier, label, selected, grayscale }: StudentCardProps,
) {
  const showInfo = tier !== undefined || label !== undefined;

  return (
    <div>
      <div className="relative">
        <img
          className={`rounded-lg ${selected ? "border border-4 border-blue-500" : ""} ${grayscale ? "grayscale" : ""}`}
          src={imageUrl} alt={name} loading="lazy"
        />
        {showInfo && (
          <div
            className="absolute bottom-0 right-0 flex flex-col items-center px-2 rounded-lg
                       bg-black bg-opacity-75 text-center font-extrabold text-xs"
          >
            {(tier) && (
              <p className={`flex items-center ${visibileTier(tier)[1] ? "text-teal-300" : "text-yellow-300"}`}>
                {(tier <= 5) ?
                  <span className="mr-0.5">★</span> :
                  <img className="w-4 h-4 mr-0.5 inline-block" src="/icons/exclusive_weapon.png" alt="고유 장비" />
                }
                <span>{visibileTier(tier)[0]}</span>
              </p>
            )}
            {(label !== undefined) && label}
          </div>
        )}
      </div>
      {name && (
        <div className="my-1 text-center leading-tight">
          {name.includes("(") ? 
            (
              <>
                <p className="text-sm">{name.split("(")[0]}</p>
                <p className="text-xs">{name.split("(")[1].replace(")", "")}</p>
              </>
            ) :
            (<p className="text-sm">{name}</p>)
          }
        </div>
      )}
    </div>
  )
}
