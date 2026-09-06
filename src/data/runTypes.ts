export type RunTypeId = "easy" | "tempo" | "recovery";

export type RunTypeOption = {
  id: RunTypeId;
  name: string;
  description: string;
};

export const RUN_TYPES: RunTypeOption[] = [
  {
    id: "easy",
    name: "Easy Run",
    description: "Relaxed, conversational effort",
  },
  {
    id: "tempo",
    name: "Tempo Run",
    description: "Sustained, focused effort",
  },
  {
    id: "recovery",
    name: "Recovery Run",
    description: "Light effort for active rest",
  },
];

/** Deterministic UI adjustment steps (not training science). */
export const DISTANCE_STEP_KM = 0.5;
export const DISTANCE_MIN_KM = 1;
export const DISTANCE_MAX_KM = 42;

export const PACE_STEP_SEC = 5;
export const PACE_MIN_SEC = 180; // 3:00/km
export const PACE_MAX_SEC = 600; // 10:00/km
