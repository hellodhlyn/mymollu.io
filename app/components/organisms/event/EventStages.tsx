import { Link } from "@remix-run/react";
import { ItemCard } from "~/components/atoms/item";
import { SubTitle, Callout } from "~/components/atoms/typography";
import { ItemCards } from "~/components/molecules/item";
import { StudentCards } from "~/components/molecules/student";
import type { Role } from "~/models/student-state";

type EventStagesProps = {
  stages: {
    difficulty: number;
    index: string;
    entryAp: number | null;
    rewards: {
      amount: number;
      item: {
        itemId: string;
        name: string;
        imageId: string;
        eventBonuses: {
          student: {
            studentId: string;
            role: Role;
          };
          ratio: number;
        }[];
      };
    }[];
  }[];
  signedIn: boolean;
  ownedStudentIds: string[];
}

export default function EventStages({ stages, signedIn, ownedStudentIds }: EventStagesProps) {
  const itemBonuses: { [itemId: string]: { item: EventStagesProps["stages"][number]["rewards"][number]["item"], ratio: number } } = {};
  for (const reward of stages.map((stage) => stage.rewards).flat()) {
    const { item, amount } = reward;
    if (itemBonuses[item.itemId] || amount < 1) {
      continue;
    }

    let appliedRatio = 0;
    let appliedStriker = 0, appliedSpecial = 0;
    for (const { student, ratio } of reward.item.eventBonuses.sort((a, b) => b.ratio - a.ratio)) {
      if (!ownedStudentIds.includes(student.studentId)) {
        continue;
      }

      if (student.role === "striker" && appliedStriker < 4) {
        appliedStriker += 1;
        appliedRatio += ratio * 100;
      }
      if (student.role === "special" && appliedSpecial < 2) {
        appliedSpecial += 1;
        appliedRatio += ratio * 100;
      }

      if (appliedStriker === 4 && appliedSpecial === 2) {
        break;
      }
    }

    itemBonuses[item.itemId] = { item, ratio: appliedRatio / 100 };
  }

  return (
    <div className="my-8">
      <SubTitle text="스테이지 보상" />
      {!signedIn && (
        <Callout className="my-4" emoji="✨">
          <span>
            <Link to="/signin" className="underline">로그인</Link> 후 학생 모집 정보를 등록하면 내 학생 보너스를 계산할 수 있어요.
          </span>
        </Callout>
      )}
      {signedIn && ownedStudentIds.length === 0 && (
        <Callout className="my-4" emoji="✨">
          <span>
            <Link to="/edit/students" className="underline">보유 학생 정보를 등록</Link>하면 내 학생 보너스를 계산할 수 있어요.
          </span>
        </Callout>
      )}
      <div className="w-screen -mx-4 md:w-auto overflow-x-scroll">
        <div className="px-4">
          <table className="my-4 table-auto">
            <thead className="bg-neutral-100 text-left">
              <tr>
                <th className="px-2 md:px-4 py-2 rounded-l-lg">#</th>
                <th className="p-2 whitespace-nowrap">AP</th>
                <th className="p-2 w-full">보상</th>
                <th className="px-2 md:px-4 py-2 whitespace-nowrap rounded-r-lg">AP 효율</th>
              </tr>
            </thead>
            <tbody>
              {stages.filter((stage) => (stage.difficulty == 1)).map((stage) => {
                const eventRewards = stage.rewards.filter((reward) => reward.amount >= 1);
                const items: { name: string, imageId: string, amount: number, bonus: boolean }[] = [];
                for (const { item, amount } of eventRewards) {
                  items.push({ name: item.name, imageId: item.imageId, amount, bonus: false });
                }
                for (const { item, amount } of eventRewards) {
                  if (itemBonuses[item.itemId] && itemBonuses[item.itemId].ratio > 0) {
                    const bonusAmount = Math.ceil(amount * itemBonuses[item.itemId].ratio);
                    items.push({ name: item.name, imageId: item.imageId, amount: bonusAmount, bonus: true });
                  }
                }

                return (
                  <tr key={`event-stage-${stage.index}`} className="py-2 hover:bg-neutral-50 transition">
                    <td className="px-2 md:px-4 py-2 font-bold rounded-l-lg">{stage.index}</td>
                    <td>
                      <ItemCard name="AP" imageId="currency_icon_ap" label={(stage.entryAp || 0).toString()} />
                    </td>
                    <td className="p-2">
                      <ItemCards itemProps={items.map((item) => ({
                        name: item.name,
                        imageId: item.imageId,
                        label: item.amount.toString(),
                        labelClassName: item.bonus ? "text-orange-300" : undefined,
                      }))} />
                    </td>
                    <td className="px-2 md:px-4 py-2 rounded-r-lg">
                      {(1.0 * (items.map(({ amount }) => amount).reduce((a, b) => a + b)) / (stage.entryAp || 1)).toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SubTitle text="학생 보너스" />
      <div>
        {Object.keys(itemBonuses).map((itemId) => {
          const { item, ratio } = itemBonuses[itemId];
          return (
            <div key={`item-bonus-${itemId}`} className="my-4">
              <div className="flex items-center">
                <div>
                  <ItemCard name={item.name} imageId={item.imageId} />
                </div>
                <div className="p-2">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-neutral-500">
                    모집 학생 보너스{signedIn ? ` +${Math.floor(ratio * 100)}%` : "는 로그인 후 확인 가능"}
                  </p>
                </div>
              </div>
              <StudentCards mobileGrid={8} pcGrid={12} cardProps={item.eventBonuses.map(({ student, ratio }) => ({
                studentId: student.studentId,
                grayscale: signedIn && !ownedStudentIds.includes(student.studentId),
                label: (<span className="text-white font-normal">{Math.floor(ratio * 100)}%</span>),
              }))} />
            </div>
          )
        })}
      </div>
    </div>
  );
}