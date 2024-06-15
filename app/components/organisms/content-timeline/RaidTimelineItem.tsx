import { bossImageUrl } from "~/models/assets";
import type { AttackType, DefenseType, RaidType, Terrain } from "~/models/content";
import { TimelineItemHeader } from "~/components/molecules/content-timeline";
import { attackTypeLocale, defenseTypeLocale, raidTypeLocale, terrainLocale } from "~/locales/ko";
import { Chip } from "~/components/atoms/button";

export type RaidTimelineItemProps = {
  raidId: string;
  raidType: RaidType;
  name: string;
  boss: string;
  terrain: Terrain;
  attackType: AttackType;
  defenseType: DefenseType;
  since: Date;
  until: Date;
};

const attachTypeColorMap: Record<AttackType, "red" | "yellow" | "blue" | "purple"> = {
  explosive: "red",
  piercing: "yellow",
  mystic: "blue",
  sonic: "purple",
};

const defenseTypeColorMap: Record<DefenseType, "red" | "yellow" | "blue" | "purple"> = {
  light: "red",
  heavy: "yellow",
  special: "blue",
  elastic: "purple",
};

export default function RaidTimelineItem(
  { raidId, raidType, name, boss, terrain, attackType, defenseType, since, until }: RaidTimelineItemProps,
) {
  return (
    <div className="py-2">
      <TimelineItemHeader
        title={name}
        label={raidTypeLocale[raidType]}
        since={since}
        until={until}
        link={`/raids/${raidId}`}
      />

      <div className="relative md:w-3/5">
        <img
          className="mb-2 rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-300"
          src={bossImageUrl(boss)} alt={`총력전 보스 ${name}`} loading="lazy"
        />
        <div className="absolute bottom-0 right-0 flex gap-x-1 p-1 text-white text-sm">
          <Chip text={terrainLocale[terrain]} color="black" />
          <Chip text={attackTypeLocale[attackType]} color={attachTypeColorMap[attackType]} />
          <Chip text={defenseTypeLocale[defenseType]} color={defenseTypeColorMap[defenseType]} />
        </div>
      </div>
    </div>
  );
}
