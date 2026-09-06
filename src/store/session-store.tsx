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
  DeferredUpdateItem,
  DeviceCondition,
  ImmediateEventKind,
  MovementCondition,
  PaceCondition,
  PaceSyncStrength,
  PendingSmartTimingEvent,
  Playlist,
  ScenarioSeed,
  SmartTimingEventKind,
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
  /** Research-only study condition (not consumer Run Type). */
  movementCondition: MovementCondition;
  /** Research-only scenario seed for controlled prototype sessions. */
  scenarioSeed: ScenarioSeed;
  /** Research device condition — Pocket Guard is derived from this. */
  deviceCondition: DeviceCondition;
  /** Research pace condition — Pace Sync adaptation is derived from this + audio mode. */
  paceCondition: PaceCondition;
  /** Active Immediate interruption event (Safety / Navigation). */
  activeImmediateEvent: ImmediateEventKind | null;
  /** Pending Smart Timing event (Important Coaching / Hydration). */
  pendingSmartTimingEvent: PendingSmartTimingEvent | null;
  /** Deferred updates queue (e.g. Milestone). Empty under Normal baseline. */
  deferredUpdates: DeferredUpdateItem[];
  /**
   * Bumped on RESET_SCENARIO so /run can cancel stale Smart Timing delivery UI.
   * Not a product feature.
   */
  researchEpoch: number;
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
  | { type: "SET_MOVEMENT_CONDITION"; movementCondition: MovementCondition }
  | { type: "SET_SCENARIO_SEED"; scenarioSeed: ScenarioSeed }
  | { type: "SET_DEVICE_CONDITION"; deviceCondition: DeviceCondition }
  | { type: "SET_PACE_CONDITION"; paceCondition: PaceCondition }
  | { type: "SET_ACTIVE_IMMEDIATE_EVENT"; event: ImmediateEventKind | null }
  | { type: "TRIGGER_IMMEDIATE_EVENT"; kind: ImmediateEventKind }
  | { type: "CLEAR_IMMEDIATE_EVENT" }
  | {
      type: "SET_PENDING_SMART_TIMING_EVENT";
      event: PendingSmartTimingEvent | null;
    }
  | { type: "TRIGGER_SMART_TIMING_EVENT"; kind: SmartTimingEventKind }
  | { type: "CLEAR_SMART_TIMING_EVENT" }
  | { type: "SET_DEFERRED_UPDATES"; deferredUpdates: DeferredUpdateItem[] }
  | {
      type: "TRIGGER_MILESTONE";
      id?: string;
      label?: string;
      createdAt?: number;
    }
  | { type: "RESET_SCENARIO" }
  | { type: "RESET_PROTOTYPE" };

const initialState: SessionState = {
  runTypeId: "easy",
  distanceKm: 5,
  targetPaceSecPerKm: 360,
  playlistId: DEFAULT_PLAYLIST.id,
  audioModeId: DEFAULT_AUDIO_MODE.id,
  customModes: [],
  customBasePresetType: null,
  movementCondition: "jog",
  scenarioSeed: "normal",
  deviceCondition: "in_hand",
  paceCondition: "on_target",
  activeImmediateEvent: null,
  pendingSmartTimingEvent: null,
  deferredUpdates: [],
  researchEpoch: 0,
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

/** Derived — not independently stored research truth. */
export function derivePocketGuardActive(deviceCondition: DeviceCondition) {
  return deviceCondition === "in_pocket";
}

/** Derived — not independently stored research truth. */
export function derivePaceSyncAdaptationActive(
  paceSyncEnabled: boolean,
  paceCondition: PaceCondition,
) {
  return paceSyncEnabled && paceCondition !== "on_target";
}

function applyResetScenario(state: SessionState): SessionState {
  return {
    ...state,
    activeImmediateEvent: null,
    pendingSmartTimingEvent: null,
    deferredUpdates: [],
    deviceCondition: "in_hand",
    paceCondition: "on_target",
    audioModeId: DEFAULT_AUDIO_MODE.id,
    scenarioSeed: "normal",
    movementCondition: "jog",
    researchEpoch: state.researchEpoch + 1,
  };
}

/**
 * Full next-participant reset: research baseline + existing consumer project defaults.
 * Navigation to /test-setup is the caller's responsibility.
 */
function applyResetPrototype(state: SessionState): SessionState {
  const researchCleared = applyResetScenario(state);
  return {
    ...researchCleared,
    runTypeId: initialState.runTypeId,
    distanceKm: initialState.distanceKm,
    targetPaceSecPerKm: initialState.targetPaceSecPerKm,
    playlistId: initialState.playlistId,
    audioModeId: initialState.audioModeId,
    customModes: [],
    customBasePresetType: null,
  };
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
    case "SET_MOVEMENT_CONDITION":
      return { ...state, movementCondition: action.movementCondition };
    case "SET_SCENARIO_SEED":
      return { ...state, scenarioSeed: action.scenarioSeed };
    case "SET_DEVICE_CONDITION":
      return { ...state, deviceCondition: action.deviceCondition };
    case "SET_PACE_CONDITION":
      return { ...state, paceCondition: action.paceCondition };
    case "SET_ACTIVE_IMMEDIATE_EVENT":
      return { ...state, activeImmediateEvent: action.event };
    case "TRIGGER_IMMEDIATE_EVENT":
      return { ...state, activeImmediateEvent: action.kind };
    case "CLEAR_IMMEDIATE_EVENT":
      return { ...state, activeImmediateEvent: null };
    case "SET_PENDING_SMART_TIMING_EVENT":
      return { ...state, pendingSmartTimingEvent: action.event };
    case "TRIGGER_SMART_TIMING_EVENT":
      return {
        ...state,
        pendingSmartTimingEvent: {
          kind: action.kind,
          id: `smart-${action.kind}-${Date.now()}`,
        },
        // Pending only — do not touch Immediate / deferred / music / run.
      };
    case "CLEAR_SMART_TIMING_EVENT":
      return { ...state, pendingSmartTimingEvent: null };
    case "SET_DEFERRED_UPDATES":
      return { ...state, deferredUpdates: action.deferredUpdates };
    case "TRIGGER_MILESTONE": {
      const item: DeferredUpdateItem = {
        id: action.id ?? `milestone-${Date.now()}`,
        kind: "milestone",
        label: action.label ?? "1 km milestone",
        createdAt: action.createdAt ?? Date.now(),
      };
      return {
        ...state,
        deferredUpdates: [...state.deferredUpdates, item],
        // Deferred only — do not touch activeImmediateEvent / music / run.
      };
    }
    case "RESET_SCENARIO":
      return applyResetScenario(state);
    case "RESET_PROTOTYPE":
      return applyResetPrototype(state);
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
  setMovementCondition: (movementCondition: MovementCondition) => void;
  setScenarioSeed: (scenarioSeed: ScenarioSeed) => void;
  setDeviceCondition: (deviceCondition: DeviceCondition) => void;
  setPaceCondition: (paceCondition: PaceCondition) => void;
  setActiveImmediateEvent: (event: ImmediateEventKind | null) => void;
  /** Study Task 4a — set Immediate Safety or Navigation (replaces any active Immediate). */
  triggerImmediateEvent: (kind: ImmediateEventKind) => void;
  clearImmediateEvent: () => void;
  setPendingSmartTimingEvent: (
    event: PendingSmartTimingEvent | null,
  ) => void;
  /** Study Task 4b — set pending Smart Timing (replaces any pending Smart Timing). */
  triggerSmartTimingEvent: (kind: SmartTimingEventKind) => void;
  clearSmartTimingEvent: () => void;
  setDeferredUpdates: (deferredUpdates: DeferredUpdateItem[]) => void;
  /**
   * Study Task 4c — append one Milestone to deferredUpdates.
   * Does not activate Immediate events or change music/run consumer state.
   */
  triggerMilestone: (options?: { label?: string; id?: string }) => void;
  resetScenario: () => void;
  /**
   * End participant session: RESET_SCENARIO + restore consumer project defaults.
   * Caller navigates to /test-setup after this.
   */
  resetPrototype: () => void;
  /** Derived from deviceCondition — not independently stored. */
  pocketGuardActive: boolean;
  /** Derived from Pace Sync enabled + paceCondition — not independently stored. */
  paceSyncAdaptationActive: boolean;
  playlist: Playlist;
  audioMode: AudioModePreset;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const value = useMemo<SessionContextValue>(() => {
    const audioMode = resolveAudioMode(state.audioModeId, state.customModes);
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
      setMovementCondition: (movementCondition) =>
        dispatch({ type: "SET_MOVEMENT_CONDITION", movementCondition }),
      setScenarioSeed: (scenarioSeed) =>
        dispatch({ type: "SET_SCENARIO_SEED", scenarioSeed }),
      setDeviceCondition: (deviceCondition) =>
        dispatch({ type: "SET_DEVICE_CONDITION", deviceCondition }),
      setPaceCondition: (paceCondition) =>
        dispatch({ type: "SET_PACE_CONDITION", paceCondition }),
      setActiveImmediateEvent: (event) =>
        dispatch({ type: "SET_ACTIVE_IMMEDIATE_EVENT", event }),
      triggerImmediateEvent: (kind) =>
        dispatch({ type: "TRIGGER_IMMEDIATE_EVENT", kind }),
      clearImmediateEvent: () => dispatch({ type: "CLEAR_IMMEDIATE_EVENT" }),
      setPendingSmartTimingEvent: (event) =>
        dispatch({ type: "SET_PENDING_SMART_TIMING_EVENT", event }),
      triggerSmartTimingEvent: (kind) =>
        dispatch({ type: "TRIGGER_SMART_TIMING_EVENT", kind }),
      clearSmartTimingEvent: () =>
        dispatch({ type: "CLEAR_SMART_TIMING_EVENT" }),
      setDeferredUpdates: (deferredUpdates) =>
        dispatch({ type: "SET_DEFERRED_UPDATES", deferredUpdates }),
      triggerMilestone: (options) =>
        dispatch({
          type: "TRIGGER_MILESTONE",
          id: options?.id,
          label: options?.label,
        }),
      resetScenario: () => dispatch({ type: "RESET_SCENARIO" }),
      resetPrototype: () => dispatch({ type: "RESET_PROTOTYPE" }),
      pocketGuardActive: derivePocketGuardActive(state.deviceCondition),
      paceSyncAdaptationActive: derivePaceSyncAdaptationActive(
        audioMode.paceSyncEnabled,
        state.paceCondition,
      ),
      playlist: resolvePlaylist(state.playlistId),
      audioMode,
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
