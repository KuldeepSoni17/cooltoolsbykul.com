import type { PlayerColor } from "@/lib/telepath/types";

export const TELEPATH_COLORS: Record<
  PlayerColor,
  {
    label: string;
    hex: string;
    soft: string;
    glow: string;
    ring: string;
    text: string;
    bg: string;
    border: string;
    sliderTrack: string;
  }
> = {
  red: {
    label: "Red",
    hex: "#ff5577",
    soft: "rgba(255, 85, 119, 0.18)",
    glow: "rgba(255, 85, 119, 0.55)",
    ring: "ring-[#ff5577]",
    text: "text-[#ff8da3]",
    bg: "bg-[rgba(255,85,119,0.12)]",
    border: "border-[rgba(255,85,119,0.45)]",
    sliderTrack: "accent-[#ff5577]",
  },
  blue: {
    label: "Blue",
    hex: "#4d8eff",
    soft: "rgba(77, 142, 255, 0.18)",
    glow: "rgba(77, 142, 255, 0.55)",
    ring: "ring-[#4d8eff]",
    text: "text-[#8fb4ff]",
    bg: "bg-[rgba(77,142,255,0.12)]",
    border: "border-[rgba(77,142,255,0.45)]",
    sliderTrack: "accent-[#4d8eff]",
  },
  green: {
    label: "Green",
    hex: "#39d98a",
    soft: "rgba(57, 217, 138, 0.18)",
    glow: "rgba(57, 217, 138, 0.55)",
    ring: "ring-[#39d98a]",
    text: "text-[#7fe8b2]",
    bg: "bg-[rgba(57,217,138,0.12)]",
    border: "border-[rgba(57,217,138,0.45)]",
    sliderTrack: "accent-[#39d98a]",
  },
};

export type PowerKey = "block" | "anonymous" | "mutual" | "reversal";

export const POWERS: {
  key: PowerKey;
  id: 0 | 1 | 2 | 3;
  name: string;
  short: string;
  description: string;
  containerField: "blockTransfer" | "anonTransfer" | "mutualIncrease" | "reversal";
}[] = [
  {
    key: "block",
    id: 0,
    name: "Block",
    short: "Block",
    description: "Stop every unit aimed at you this round.",
    containerField: "blockTransfer",
  },
  {
    key: "anonymous",
    id: 1,
    name: "Anonymous",
    short: "Anon",
    description: "Send units this round without revealing the source.",
    containerField: "anonTransfer",
  },
  {
    key: "mutual",
    id: 2,
    name: "Mutual Increase",
    short: "Mutual",
    description: "You and a rival both gain one unit. Choose wisely.",
    containerField: "mutualIncrease",
  },
  {
    key: "reversal",
    id: 3,
    name: "Reversal",
    short: "Reverse",
    description: "Bounce the round's transfers back at their senders.",
    containerField: "reversal",
  },
];
