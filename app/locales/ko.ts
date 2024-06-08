import { AttackType, DefenseType, EventType, PickupType, RaidType, Terrain } from "~/models/content";

export const attackTypeLocale: Record<AttackType, string> = {
  explosive: "폭발",
  piercing: "관통",
  mystic: "신비",
  sonic: "진동",
};

export const defenseTypeLocale: Record<DefenseType, string> = {
  light: "경장갑",
  heavy: "중장갑",
  special: "특수장갑",
  elastic: "탄력장갑",
};

export const terrainLocale: Record<Terrain, string> = {
  indoor: "실내",
  outdoor: "야외",
  street: "시가지",
};

export const eventTypeLocale: Record<EventType, string> = {
  event: "이벤트",
  immortal_event: "이벤트 상설화",
  mini_event: "미니 이벤트",
  guide_mission: "가이드 미션",
  collab: "콜라보 이벤트",
  fes: "페스 이벤트",
  pickup: "모집",
  campaign: "캠페인",
  exercise: "종합전술시험",
  main_story: "메인 스토리",
};

export const raidTypeLocale: Record<RaidType, string> = {
  total_assault: "총력전",
  elimination: "대결전",
  unlimit: "제약해제결전",
};

export const pickupTypeLocale: Record<PickupType, string> = {
  usual: "일반",
  limited: "한정",
  given: "배포",
  fes: "페스",
};

export function pickupLabelLocale({ type, rerun }: { type: PickupType, rerun: boolean }): string {
  const labelTexts: string[] = [];
  if (type === "given") {
    labelTexts.push("배포");
  } else if (type === "limited") {
    labelTexts.push("한정");
  } else if (type === "fes") {
    labelTexts.push("페스");
  }

  if (type !== "given") {
    if (rerun) {
      labelTexts.push("복각");
    } else {
      labelTexts.push("신규");
    }
  }

  return labelTexts.join(" ");
}

