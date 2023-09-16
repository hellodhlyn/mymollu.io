import { useEffect, useState } from "react";

type EditTierProps = {
  initialTier: number;
  currentTier: number;
  onUpdate: (tier: number) => void;
};

export default function EditTier(
  { initialTier, currentTier, onUpdate }: EditTierProps,
) {
  return (
    <div className="text-2xl font-thin">
      <div className="text-yellow-500">
        {[1, 2, 3, 4, 5].map((position) => (
          <span
            key={`tier-${position}`}
            className="cursor-pointer hover:text-yellow-600 transition"
            onClick={() => { if (position >= initialTier) { onUpdate(position); } }}
          >
            {currentTier >= position ? "★" : "☆"}
          </span>
        ))}
      </div>
      <div className="text-teal-500">
        {[6, 7, 8].map((position) => (
          <span
            key={`tier-${position}`}
            className="cursor-pointer hover:text-teal-600 transition"
            onClick={() => { onUpdate(position); }}
          >
            {currentTier >= position ? "★" : "☆"}
          </span>
        ))}
      </div>
    </div>
  )
}
