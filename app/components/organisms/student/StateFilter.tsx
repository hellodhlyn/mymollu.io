import { Archery, Running, Sort, Star } from "iconoir-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FilterButtons } from "~/components/molecules/student";
import { Student } from "~/models/student";
import { StudentState } from "~/models/studentState";

type Filter = {
  minimumTier: number;
  role: Student["role"] | null;
  attackTypes: Student["attackType"][];
}

type Sort = {
  by: "tier" | "name" | null;
}

export function useStateFilter(
  initStates: StudentState[],
  useFilter: boolean = true,
  useSort: boolean = true,
): [JSX.Element, StudentState[], Dispatch<SetStateAction<StudentState[]>>] {
  const [allStates, setAllStates] = useState(initStates);
  const [filter, setFilter] = useState<Filter>({
    minimumTier: 1,
    role: null,
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
      if (filter.role && student.role !== filter.role) {
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
      } else if (sort.by === "name") {
        return a.student.name.localeCompare(b.student.name);
      }
      return defaultComparision;
    });

    setFilteredStates(newFilteredStates);
  }, [allStates, filter, sort]);

  return [(
    <div className="my-8">
      <p className="my-2 font-bold text-xl">
        {[
          useFilter ? "필터" : null,
          useSort ? "정렬" : null,
        ].filter((text) => text).join(" 및 ")}
      </p>
      {useFilter && (
        <>
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
          <FilterButtons Icon={Running} exclusive={true} buttonProps={[
            {
              text: "스트라이커", color: "bg-red-500",
              onToggle: (activated) => { setFilter((prev) => ({ ...prev, role: activated ? "striker" : null })) },
            },
            {
              text: "스페셜", color: "bg-blue-500",
              onToggle: (activated) => { setFilter((prev) => ({ ...prev, role: activated ? "special" : null })) },
            },
          ]} />
        </>
      )}
      {useSort && (
        <FilterButtons Icon={Sort} exclusive={true} buttonProps={[
          { text: "★ 등급", onToggle: (activated) => { setSort({ by: activated ? "tier" : null }) } },
          { text: "이름", onToggle: (activated) => { setSort({ by: activated ? "name" : null }) } },
        ]} />
      )}
    </div>
  ), filteredStates, setAllStates];
}
