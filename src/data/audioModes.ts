import type { AudioModePreset } from "@/types";

export const AUDIO_MODE_PRESETS: AudioModePreset[] = [
  {
    id: "music-first",
    type: "music_first",
    name: "Music First",
    description: "Keeps music flow intact. Only safety and navigation break in immediately.",
    policies: {
      safety: "immediate",
      navigation: "immediate",
      workout: "smart",
      hydration: "smart",
      milestone: "deferred",
      routine: "deferred",
    },
    paceSyncEnabled: false,
  },
  {
    id: "pace-sync",
    type: "pace_sync",
    name: "Pace Sync",
    description: "Same interruption rules as Music First, with music adapting to target pace.",
    policies: {
      safety: "immediate",
      navigation: "immediate",
      workout: "smart",
      hydration: "smart",
      milestone: "deferred",
      routine: "deferred",
    },
    paceSyncEnabled: true,
    adaptation: "normal",
  },
  {
    id: "balanced",
    type: "balanced",
    name: "Balanced",
    description: "More in-run information. Milestones and routine stats use smart timing.",
    policies: {
      safety: "immediate",
      navigation: "immediate",
      workout: "smart",
      hydration: "smart",
      milestone: "smart",
      routine: "smart",
    },
    paceSyncEnabled: false,
  },
];
