export type Student = {
  id: string;
  name: string;
  imageUrl: string;
  tier: number;
  attackType: "explosive" | "piercing" | "mystic" | "sonic" | null;
};
