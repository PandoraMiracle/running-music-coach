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

/** Research device condition (Pocket Guard simulation). Same values as PocketState. */
export type DeviceCondition = PocketState;

export type MusicStatus = "playing" | "paused";

/** Research pace mismatch condition for Pace Sync study tasks. */
export type PaceCondition = "on_target" | "too_slow" | "too_fast";

/** Active Immediate interruption (Music First Safety / Navigation). */
export type ImmediateEventKind = "safety" | "navigation";

/** Smart Timing study simulation kinds (controlled delay, not a real scheduler). */
export type SmartTimingEventKind = "important_coaching" | "hydration";

export type PendingSmartTimingEvent = {
  kind: SmartTimingEventKind;
  /** Unique id so replacement cancels/restarts the controlled delay timer. */
  id: string;
};

/** Deferred queue item (e.g. Milestone saved for pause/finish). */
export type DeferredUpdateItem = {
  id: string;
  kind: "milestone";
  label: string;
  createdAt: number;
};

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

export type AudioModePreset = {
  id: string;
  type: Exclude<AudioModeType, "custom">;
  name: string;
  description: string;
  policies: AudioModePolicies;
  paceSyncEnabled: boolean;
  adaptation?: PaceSyncStrength;
};
