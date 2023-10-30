import { CheckCircle, XmarkCircle } from "iconoir-react";
import { SmallButton } from "~/components/atoms/form";
import TierSelector from "~/components/molecules/editor/TierSelector";

type SpecEditBulkActionsProps = {
  selectedAny: boolean;
  onToggleAll: (selected: boolean) => void;
  onSelectTier: (tier: number) => void;
};

export default function SpecEditBulkActions(
  { selectedAny, onToggleAll, onSelectTier }: SpecEditBulkActionsProps,
) {
  return (
    <>
      <p className="my-2 font-bold text-xl">일괄 적용</p>
      <p className="text-gray-700">학생을 선택 후 한꺼번에 성장 상태를 반영할 수 있습니다.</p>

      <div className="my-4 flex">
        {selectedAny ?
          (
            <SmallButton onClick={() => { onToggleAll(false); }}>
              <XmarkCircle className="mr-1 w-4 h-4" strokeWidth={2} />
              <span>모두 해제</span>
            </SmallButton>
          ) :
          (
            <SmallButton onClick={() => { onToggleAll(true); }}>
              <CheckCircle className="mr-1 w-4 h-4" strokeWidth={2} />
              <span>모두 선택</span>
            </SmallButton>
          )
        }
        {selectedAny && (
          <>
            <TierSelector onSelect={onSelectTier} />
          </>
        )}
      </div>
    </>
  );
}
