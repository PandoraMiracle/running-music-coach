import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import { AUDIO_MODE_PRESETS } from "@/data/audioModes";
import { PLAYLISTS } from "@/data/playlists";
import {
  DISTANCE_MAX_KM,
  DISTANCE_MIN_KM,
  DISTANCE_STEP_KM,
  PACE_MAX_SEC,
  PACE_MIN_SEC,
  PACE_STEP_SEC,
  type RunTypeId,
} from "@/data/runTypes";
import { DEFAULT_AUDIO_MODE, DEFAULT_PLAYLIST } from "@/store/defaults";
import type {
  AudioModePolicies,
  AudioModePreset,
  AudioModeType,
  DeferredUpdate,
  EventKind,
  MovementCondition,
  PaceSyncState,
  PaceSyncStrength,
  Playlist,
  ScenarioSeed,
} from "@/types";

/** Immutable default preset types used as S05 base templates. */
export type DefaultAudioModeType = Exclude<AudioModeType, "custom">;

/** Session-only custom modes (never overwrite frozen presets). */
export type SessionCustomAudioMode = {
  id: string;
  name: string;
  basePresetType: DefaultAudioModeType;
  basePresetName: string;
  policies: AudioModePolicies;
  paceSyncEnabled: boolean;
  adaptation: PaceSyncStrength;
};

export type SessionState = {
  runTypeId: RunTypeId;
  distanceKm: number;
  targetPaceSecPerKm: number;
  playlistId: string;
  audioModeId: string;
  /** Empty until S05 saves a custom mode. */
  customModes: SessionCustomAudioMode[];
  /** Base preset for the next Custom Mode editor open. */
  customBasePresetType: DefaultAudioModeType | null;
  /**
   * Research/runtime flags for S07 overlays.
   * Driven by interruption / Pocket Guard logic — never by the bell UI.
   */
  immediateAlertKind: "safety" | "navigation" | null;
  smartAlertKind: "workout" | "hydration" | null;
  deferredUpdates: DeferredUpdate[];
  pocketGuardActive: boolean;
  paceSyncState: PaceSyncState;
  /** Research-only study condition (not consumer Run Type). */
  movementCondition: MovementCondition;
  /** Research-only scenario seed for controlled prototype sessions. */
  scenarioSeed: ScenarioSeed;
};

type SessionAction =
  | { type: "SET_RUN_TYPE"; runTypeId: RunTypeId }
  | { type: "ADJUST_DISTANCE"; deltaSteps: number }
  | { type: "ADJUST_PACE"; deltaSteps: number }
  | { type: "SET_PLAYLIST"; playlistId: string }
  | { type: "SET_AUDIO_MODE"; audioModeId: string }
  | { type: "SET_CUSTOM_BASE_PRESET"; basePresetType: DefaultAudioModeType }
  | { type: "SAVE_CUSTOM_MODE"; mode: SessionCustomAudioMode }
  | { type: "UPDATE_CUSTOM_MODE"; mode: SessionCustomAudioMode }
  | { type: "TRIGGER_EVENT"; kind: EventKind; label: string }
  | { type: "CLEAR_IMMEDIATE_ALERT" }
  | { type: "CLEAR_SMART_ALERT" }
  | { type: "SET_POCKET_GUARD_ACTIVE"; active: boolean }
  | { type: "SET_PACE_SYNC_STATE"; paceSyncState: PaceSyncState }
  | { type: "RESTORE_TO_MUSIC_FIRST" }
  | { type: "SET_MOVEMENT_CONDITION"; movementCondition: MovementCondition }
  | { type: "SET_SCENARIO_SEED"; scenarioSeed: ScenarioSeed }
  | { type: "RESET_PROTOTYPE" };

const initialState: SessionState = {
  runTypeId: "easy",
  distanceKm: 5,
  targetPaceSecPerKm: 360,
  playlistId: DEFAULT_PLAYLIST.id,
  audioModeId: DEFAULT_AUDIO_MODE.id,
  customModes: [],
  customBasePresetType: null,
  immediateAlertKind: null,
  smartAlertKind: null,
  deferredUpdates: [],
  pocketGuardActive: false,
  paceSyncState: "on_target",
  movementCondition: "jog",
  scenarioSeed: "normal",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundDistance(km: number) {
  return Math.round(km * 10) / 10;
}

function resolvePlaylist(playlistId: string): Playlist {
  return PLAYLISTS.find((item) => item.id === playlistId) ?? DEFAULT_PLAYLIST;
}

function resolveAudioMode(
  audioModeId: string,
  customModes: SessionCustomAudioMode[],
): AudioModePreset {
  const preset = AUDIO_MODE_PRESETS.find((item) => item.id === audioModeId);
  if (preset) return preset;

  const custom = customModes.find((item) => item.id === audioModeId);
  if (custom) {
    return {
      id: custom.id,
      type: custom.basePresetType,
      name: custom.name,
      description: `Based on ${custom.basePresetName}`,
      policies: custom.policies,
      paceSyncEnabled: custom.paceSyncEnabled,
      adaptation: custom.adaptation,
    };
  }

  return DEFAULT_AUDIO_MODE;
}

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "SET_RUN_TYPE":
      return { ...state, runTypeId: action.runTypeId };
    case "ADJUST_DISTANCE": {
      const next = roundDistance(
        state.distanceKm + action.deltaSteps * DISTANCE_STEP_KM,
      );
      return {
        ...state,
        distanceKm: clamp(next, DISTANCE_MIN_KM, DISTANCE_MAX_KM),
      };
    }
    case "ADJUST_PACE": {
      const next = state.targetPaceSecPerKm + action.deltaSteps * PACE_STEP_SEC;
      return {
        ...state,
        targetPaceSecPerKm: clamp(next, PACE_MIN_SEC, PACE_MAX_SEC),
      };
    }
    case "SET_PLAYLIST":
      return { ...state, playlistId: action.playlistId };
    case "SET_AUDIO_MODE":
      return { ...state, audioModeId: action.audioModeId };
    case "SET_CUSTOM_BASE_PRESET":
      return { ...state, customBasePresetType: action.basePresetType };
    case "SAVE_CUSTOM_MODE":
      return {
        ...state,
        customModes: [...state.customModes, action.mode],
        audioModeId: action.mode.id,
      };
    case "UPDATE_CUSTOM_MODE":
      return {
        ...state,
        customModes: state.customModes.map((item) =>
          item.id === action.mode.id ? action.mode : item,
        ),
        audioModeId: action.mode.id,
      };
    case "TRIGGER_EVENT": {
      const policy = resolveAudioMode(state.audioModeId, state.customModes)
        .policies[action.kind];
      if (policy === "immediate") {
        return {
          ...state,
          immediateAlertKind: action.kind as "safety" | "navigation",
        };
      }
      if (policy === "smart") {
        return {
          ...state,
          smartAlertKind: action.kind as "workout" | "hydration",
        };
      }
      return {
        ...state,
        deferredUpdates: [
          ...state.deferredUpdates,
          {
            id: `${action.kind}-${Date.now()}`,
            kind: action.kind,
            label: action.label,
          },
        ],
      };
    }
    case "CLEAR_IMMEDIATE_ALERT":
      return { ...state, immediateAlertKind: null };
    case "CLEAR_SMART_ALERT":
      return { ...state, smartAlertKind: null };
    case "SET_POCKET_GUARD_ACTIVE":
      return { ...state, pocketGuardActive: action.active };
    case "SET_PACE_SYNC_STATE":
      return { ...state, paceSyncState: action.paceSyncState };
    case "RESTORE_TO_MUSIC_FIRST":
      return {
        ...state,
        audioModeId: DEFAULT_AUDIO_MODE.id,
        paceSyncState: "on_target",
      };
    case "SET_MOVEMENT_CONDITION":
      return { ...state, movementCondition: action.movementCondition };
    case "SET_SCENARIO_SEED":
      return { ...state, scenarioSeed: action.scenarioSeed };
    case "RESET_PROTOTYPE":
      return { ...initialState };
    default:
      return state;
  }
}

type SessionContextValue = {
  state: SessionState;
  setRunType: (runTypeId: RunTypeId) => void;
  adjustDistance: (deltaSteps: number) => void;
  adjustPace: (deltaSteps: number) => void;
  setPlaylist: (playlistId: string) => void;
  setAudioMode: (audioModeId: string) => void;
  setCustomBasePreset: (basePresetType: DefaultAudioModeType) => void;
  saveCustomMode: (mode: SessionCustomAudioMode) => void;
  updateCustomMode: (mode: SessionCustomAudioMode) => void;
  /** Research/runtime — not exposed on Running UI. */
  triggerEvent: (kind: EventKind, label: string) => void;
  clearImmediateAlert: () => void;
  clearSmartAlert: () => void;
  setPocketGuardActive: (active: boolean) => void;
  setPaceSyncState: (paceSyncState: PaceSyncState) => void;
  restoreToMusicFirst: () => void;
  setMovementCondition: (movementCondition: MovementCondition) => void;
  setScenarioSeed: (scenarioSeed: ScenarioSeed) => void;
  /** Study "next participant" reset — full return to project defaults. */
  resetPrototype: () => void;
  playlist: Playlist;
  audioMode: AudioModePreset;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const value = useMemo<SessionContextValue>(() => {
    return {
      state,
      setRunType: (runTypeId) => dispatch({ type: "SET_RUN_TYPE", runTypeId }),
      adjustDistance: (deltaSteps) =>
        dispatch({ type: "ADJUST_DISTANCE", deltaSteps }),
      adjustPace: (deltaSteps) => dispatch({ type: "ADJUST_PACE", deltaSteps }),
      setPlaylist: (playlistId) => dispatch({ type: "SET_PLAYLIST", playlistId }),
      setAudioMode: (audioModeId) =>
        dispatch({ type: "SET_AUDIO_MODE", audioModeId }),
      setCustomBasePreset: (basePresetType) =>
        dispatch({ type: "SET_CUSTOM_BASE_PRESET", basePresetType }),
      saveCustomMode: (mode) => dispatch({ type: "SAVE_CUSTOM_MODE", mode }),
      updateCustomMode: (mode) =>
        dispatch({ type: "UPDATE_CUSTOM_MODE", mode }),
      triggerEvent: (kind, label) =>
        dispatch({ type: "TRIGGER_EVENT", kind, label }),
      clearImmediateAlert: () => dispatch({ type: "CLEAR_IMMEDIATE_ALERT" }),
      clearSmartAlert: () => dispatch({ type: "CLEAR_SMART_ALERT" }),
      setPocketGuardActive: (active) =>
        dispatch({ type: "SET_POCKET_GUARD_ACTIVE", active }),
      setPaceSyncState: (paceSyncState) =>
        dispatch({ type: "SET_PACE_SYNC_STATE", paceSyncState }),
      restoreToMusicFirst: () => dispatch({ type: "RESTORE_TO_MUSIC_FIRST" }),
      setMovementCondition: (movementCondition) =>
        dispatch({ type: "SET_MOVEMENT_CONDITION", movementCondition }),
      setScenarioSeed: (scenarioSeed) =>
        dispatch({ type: "SET_SCENARIO_SEED", scenarioSeed }),
      resetPrototype: () => dispatch({ type: "RESET_PROTOTYPE" }),
      playlist: resolvePlaylist(state.playlistId),
      audioMode: resolveAudioMode(state.audioModeId, state.customModes),
    };
  }, [state]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
