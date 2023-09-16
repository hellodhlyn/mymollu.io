import { Archery, Sort, Star } from "iconoir-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FilterButtons } from "~/components/molecules/student";
import { Student } from "~/models/student";
import { StudentState } from "~/models/studentState";

type Filter = {
  minimumTier: number;
  attackTypes: Student["attackType"][];
}

type Sort = {
  by: "tier" | null;
}

export function useStateFilter(initStates: StudentState[]): [JSX.Element, StudentState[], Dispatch<SetStateAction<StudentState[]>>] {
  const [allStates, setAllStates] = useState(initStates);
  const [filter, setFilter] = useState<Filter>({
    minimumTier: 1,
    attackTypes: [],
  });
  const [sort, setSort] = useState<Sort>({
    by: null,
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
    const newFilteredStates = allStates.filter(({ student }) => {
      if (student.initialTier < filter.minimumTier) {
        return false;
      }
      if (filter.attackTypes.length > 0 && !filter.attackTypes.includes(student.attackType)) {
        return false;
      }
      return true;
    });

    newFilteredStates.sort((a, b) => {
      const defaultComparision = a.student.order - b.student.order;
      if (sort.by === "tier") {
        const tierA = a.tier ?? a.student.initialTier;
        const tierB = b.tier ?? b.student.initialTier;
        if (tierA === tierB) {
          return defaultComparision;
        }
        return tierB - tierA;
      }
      return defaultComparision;
    })

    setFilteredStates(newFilteredStates);
  }, [allStates, filter, sort]);

  return [(
    <div className="my-8">
      <p className="my.-2 font-bold text-xl">필터 및 정렬</p>
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
      <FilterButtons Icon={Sort} buttonProps={[
        { text: "★ 등급", onToggle: (activated) => { setSort({ by: activated ? "tier" : null }) } },
      ]} />
    </div>
  ), filteredStates, setAllStates];
}
