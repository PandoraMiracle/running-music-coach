export type MovementCondition = "walk" | "jog" | "run";

export type AudioModeType =
  | "music_first"
  | "pace_sync"
  | "balanced"
  | "custom";

export type DeliveryPolicy = "immediate" | "smart" | "deferred";

export type PaceSyncStrength = "gentle" | "normal" | "strong";

export type RunStatus = "idle" | "ready" | "running" | "paused" | "finished";

export type PocketState = "in_hand" | "in_pocket";

export type MusicStatus = "playing" | "paused";

export type EventKind =
  | "safety"
  | "navigation"
  | "workout"
  | "hydration"
  | "milestone"
  | "routine";

export type ScenarioSeed =
  | "normal"
  | "pace_mismatch"
  | "routine_interruption"
  | "safety_interruption";

export type RunningPlan = {
  id: string;
  name: string;
  targetPaceSecPerKm: number;
  distanceKm: number;
  description: string;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  bpm: number;
};

export type Playlist = {
  id: string;
  title: string;
  approxBpm: number;
  tracks: Track[];
};

export type AudioModePolicies = Record<EventKind, DeliveryPolicy>;

export type PaceSyncState = "on_target" | "too_slow" | "too_fast";

export type DeferredUpdate = {
  id: string;
  kind: EventKind;
  label: string;
};

export type AudioModePreset = {
  id: string;
  type: Exclude<AudioModeType, "custom">;
  name: string;
  description: string;
  policies: AudioModePolicies;
  paceSyncEnabled: boolean;
  adaptation?: PaceSyncStrength;
};
