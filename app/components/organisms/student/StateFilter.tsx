import { Archery, Star } from "iconoir-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FilterButtons } from "~/components/molecules/student";
import { Student } from "~/models/student";
import { StudentState } from "~/models/studentState";

type Filter = {
  minimumTier: number;
  attackTypes: Student["attackType"][];
}

export function useStateFilter(initStates: StudentState[]): [JSX.Element, StudentState[], Dispatch<SetStateAction<StudentState[]>>] {
  const [allStates, setAllStates] = useState(initStates);
  const [filter, setFilter] = useState<Filter>({
    minimumTier: 1,
    attackTypes: [],
  });

  const toggleAttackType = (attackType: Student["attackType"]): (activated: boolean) => void => {
    return (activated: boolean) => {
      setFilter((prev) => {
        if (activated && !prev.attackTypes.includes(attackType)) {
          return { ...prev, attackTypes: [...prev.attackTypes, attackType] };
        }
        if (!activated && prev.attackTypes.includes(attackType)) {
          return { ...prev, attackTypes: prev.attackTypes.filter((type) => type !== attackType) };
        }
        return prev;
      });
    };
  }

  const [filteredStates, setFilteredStates] = useState(allStates);
  useEffect(() => {
    setFilteredStates(allStates.filter(({ student }) => {
      if (student.tier < filter.minimumTier) {
        return false;
      }
      if (filter.attackTypes.length > 0 && !filter.attackTypes.includes(student.attackType)) {
        return false;
      }
      return true;
    }));
  }, [allStates, filter]);

  return [(
    <div className="my-8">
      <p className="my.-2 font-bold text-xl">필터</p>
      <FilterButtons Icon={Star} buttonProps={[
        {
          text: "3성 미만 감추기",
          onToggle: (activated) => { setFilter((prev) => ({ ...prev, minimumTier: activated ? 3 : 1 })) },
        },
      ]} />
      <FilterButtons Icon={Archery} buttonProps={[
        { text: "폭발", color: "bg-red-500", onToggle: toggleAttackType("explosive") },
        { text: "관통", color: "bg-yellow-500", onToggle: toggleAttackType("piercing") },
        { text: "신비", color: "bg-blue-500", onToggle: toggleAttackType("mystic") },
      ]} />
    </div>
  ), filteredStates, setAllStates];
}
