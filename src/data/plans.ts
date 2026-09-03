import type { RunningPlan } from "@/types";

export const RUNNING_PLANS: RunningPlan[] = [
  {
    id: "easy-5k",
    name: "Easy 5K",
    targetPaceSecPerKm: 360,
    distanceKm: 5,
    description: "Easy aerobic run to settle into rhythm without chasing speed.",
  },
  {
    id: "tempo-8k",
    name: "Tempo 8K",
    targetPaceSecPerKm: 320,
    distanceKm: 8,
    description: "Sustained tempo effort with a controlled, honest target pace.",
  },
  {
    id: "recovery-3k",
    name: "Recovery 3K",
    targetPaceSecPerKm: 420,
    distanceKm: 3,
    description: "Short recovery jog with a relaxed target pace.",
  },
];
