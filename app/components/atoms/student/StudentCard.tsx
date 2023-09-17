export type StudentCardProps = {
  id: string;
  imageUrl: string;
  name?: string;

  tier?: number;

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
  { name, imageUrl, tier, grayscale }: StudentCardProps,
) {
  const showInfo = tier !== undefined;

  return (
    <div>
      <div className="relative">
        <img className={`rounded-lg${grayscale ? " grayscale" : ""}`} src={imageUrl} alt={name} />
        {showInfo && (
          <div className="absolute bottom-0 right-0 px-2 rounded-lg bg-black bg-opacity-75 text-center font-extrabold text-sm">
            {(tier !== undefined) && (
              <p className={`flex items-center ${visibileTier(tier)[1] ? "text-teal-300" : "text-yellow-300"}`}>
                {(tier <= 5) ?
                  <span className="mr-1">★</span> :
                  <img className="w-4 h-4 mr-1 inline-block" src="/icons/exclusive_weapon.png" />
                }
                <span>{visibileTier(tier)[0]}</span>
              </p>
            )}
          </div>
        )}
      </div>
      {name && <p className="text-center text-sm">{name}</p>}
    </div>
  )
}
