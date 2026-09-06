import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { EVENT_LABELS, ResearchPanel } from "@/components/research-panel";
import {
  RunStatusOverlay,
  type RunOverlayKind,
} from "@/components/run-status-overlay";
import { formatDuration, formatPace } from "@/constants/format";
import { ROUTES } from "@/constants/routes";
import { Spacing } from "@/constants/theme";
import {
  pulseHaptic,
  useRunGestures,
} from "@/hooks/use-run-gestures";
import { useSession } from "@/store/session-store";
import type { MusicStatus } from "@/types";

const IMMEDIATE_ALERT_MS = 3000;
const SMART_ALERT_MS = 3500;
const PACE_SYNC_NOTICE_MS = 2600;

const RunColors = {
  bg: "#F5F7F4",
  surface: "#FFFFFF",
  border: "#E4E9E4",
  ink: "#0F1714",
  secondary: "#47544F",
  muted: "#73807A",
  accent: "#00A87A",
} as const;

const ARTWORK_COLORS: Record<string, string> = {
  "morning-momentum": "#1A7360",
  "easy-groove": "#3D6B8C",
  "race-focus": "#B45A3C",
  "night-run": "#3A4560",
  "recovery-mix": "#6B7A4A",
};

/** Existing mock in-run snapshot (not a second state model). */
const MOCK_CURRENT_PACE_SEC = 368; // 6:08 /km
const MOCK_DISTANCE_KM = 1.6;
const MOCK_ELAPSED_SEC = 9 * 60 + 42;
const PACE_FEEDBACK_MS = 1600;

/** Shared pace size for NORMAL + PAUSED (390px-safe). */
const PACE_VALUE_SIZE = 76;
const FINISH_SLOT_HEIGHT = 48;
const PACE_FEEDBACK_SLOT_HEIGHT = 26;

/**
 * Safety wins visual priority when both runtime flags are active.
 * Overlays are never driven by the passive bell indicator.
 */
function resolveActiveOverlay(
  immediateAlertKind: "safety" | "navigation" | null,
  pocketGuardActive: boolean,
): RunOverlayKind | null {
  if (immediateAlertKind) return immediateAlertKind;
  if (pocketGuardActive) return "pocket_guard";
  return null;
}

function paceParts(secPerKm: number) {
  const formatted = formatPace(secPerKm);
  return {
    value: formatted.replace("/km", "").trim(),
    unit: "/km",
  };
}

/** Shared S07 pace block — identical in NORMAL and PAUSED. */
function PaceDisplay({
  value,
  unit,
  feedbackText,
}: {
  value: string;
  unit: string;
  feedbackText?: string | null;
}) {
  return (
    <View style={styles.paceBlock}>
      <Text style={styles.paceLabel}>Current pace</Text>
      <Text style={styles.paceValue}>{value}</Text>
      <Text style={styles.paceUnit}>{unit}</Text>
      <View style={styles.paceFeedbackSlot}>
        {feedbackText ? (
          <Text style={styles.paceFeedbackTarget}>{feedbackText}</Text>
        ) : null}
      </View>
    </View>
  );
}

/** Shared S07 stats row — identical in NORMAL and PAUSED. */
function StatsRow({
  target,
  distance,
  time,
}: {
  target: string;
  distance: string;
  time: string;
}) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.stat}>
        <Text style={styles.statLabel}>Target</Text>
        <Text style={styles.statValue}>{target}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statLabel}>Distance</Text>
        <Text style={styles.statValue}>{distance}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statLabel}>Time</Text>
        <Text style={styles.statValue}>{time}</Text>
      </View>
    </View>
  );
}

/** Shared S07 Now Playing surface — identical position/style in both states. */
function NowPlayingRow({
  artworkColor,
  title,
  subtitle,
}: {
  artworkColor: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.nowPlaying}>
      <View style={[styles.artwork, { backgroundColor: artworkColor }]} />
      <View style={styles.trackMeta}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/**
 * Shared metrics group for NORMAL + PAUSED.
 * Vertically positioned by the stage spacers — not by stacked marginTops.
 */
function MetricsArea({
  paceValue,
  paceUnit,
  feedbackText,
  target,
  distance,
  time,
  artworkColor,
  trackTitle,
  trackSubtitle,
}: {
  paceValue: string;
  paceUnit: string;
  feedbackText?: string | null;
  target: string;
  distance: string;
  time: string;
  artworkColor: string;
  trackTitle: string;
  trackSubtitle: string;
}) {
  return (
    <View style={styles.metricsArea}>
      <PaceDisplay
        value={paceValue}
        unit={paceUnit}
        feedbackText={feedbackText}
      />
      <StatsRow target={target} distance={distance} time={time} />
      <NowPlayingRow
        artworkColor={artworkColor}
        title={trackTitle}
        subtitle={trackSubtitle}
      />
    </View>
  );
}

export default function RunScreen() {
  const {
    state,
    playlist,
    audioMode,
    triggerEvent,
    clearImmediateAlert,
    clearSmartAlert,
    setPocketGuardActive,
    setPaceSyncState,
    restoreToMusicFirst,
  } = useSession();

  const [musicStatus, setMusicStatus] = useState<MusicStatus>("playing");
  const [trackIndex, setTrackIndex] = useState(0);
  const [runPaused, setRunPaused] = useState(false);
  const [paceFeedback, setPaceFeedback] = useState(false);
  const [researchPanelOpen, setResearchPanelOpen] = useState(false);
  const [paceSyncNotice, setPaceSyncNotice] = useState(false);
  const paceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paceSyncNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const prevPaceSyncStateRef = useRef(state.paceSyncState);
  const prevImmediateAlertKindRef = useRef(state.immediateAlertKind);

  const tracks = playlist.tracks;
  const track = tracks[Math.min(trackIndex, tracks.length - 1)] ?? tracks[0];
  const currentPace = paceParts(MOCK_CURRENT_PACE_SEC);
  const targetPace = paceParts(state.targetPaceSecPerKm);
  const artworkColor = ARTWORK_COLORS[playlist.id] ?? RunColors.accent;
  const musicLabel = musicStatus === "playing" ? "Playing" : "Paused";
  const deferredCount = state.deferredUpdates.length;
  const activeOverlay = resolveActiveOverlay(
    state.immediateAlertKind,
    state.pocketGuardActive,
  );

  useEffect(() => {
    return () => {
      if (paceTimerRef.current) clearTimeout(paceTimerRef.current);
      if (paceSyncNoticeTimerRef.current) {
        clearTimeout(paceSyncNoticeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!state.immediateAlertKind) return;
    const timer = setTimeout(clearImmediateAlert, IMMEDIATE_ALERT_MS);
    return () => clearTimeout(timer);
  }, [state.immediateAlertKind, clearImmediateAlert]);

  useEffect(() => {
    const prev = prevImmediateAlertKindRef.current;
    prevImmediateAlertKindRef.current = state.immediateAlertKind;
    if (state.immediateAlertKind && state.immediateAlertKind !== prev) {
      pulseHaptic("alert");
    }
  }, [state.immediateAlertKind]);

  useEffect(() => {
    if (!state.smartAlertKind) return;
    const timer = setTimeout(clearSmartAlert, SMART_ALERT_MS);
    return () => clearTimeout(timer);
  }, [state.smartAlertKind, clearSmartAlert]);

  useEffect(() => {
    const prev = prevPaceSyncStateRef.current;
    prevPaceSyncStateRef.current = state.paceSyncState;
    if (
      audioMode.paceSyncEnabled &&
      state.paceSyncState !== "on_target" &&
      state.paceSyncState !== prev
    ) {
      setPaceSyncNotice(true);
      if (paceSyncNoticeTimerRef.current) {
        clearTimeout(paceSyncNoticeTimerRef.current);
      }
      paceSyncNoticeTimerRef.current = setTimeout(() => {
        setPaceSyncNotice(false);
      }, PACE_SYNC_NOTICE_MS);
    }
  }, [state.paceSyncState, audioMode.paceSyncEnabled]);

  const toggleRunPause = useCallback(() => {
    setPaceFeedback(false);
    if (paceTimerRef.current) clearTimeout(paceTimerRef.current);
    setRunPaused((paused) => {
      if (paused) {
        pulseHaptic("confirm");
        return false;
      }
      pulseHaptic("strong");
      return true;
    });
  }, []);

  const finishRun = useCallback(() => {
    // Reuse existing provisional completion route; full Phase E polish later.
    router.replace(ROUTES.summary);
  }, []);

  const onDoubleTap = useCallback(() => {
    pulseHaptic("light");
    setMusicStatus((current) =>
      current === "playing" ? "paused" : "playing",
    );
  }, []);

  const onSwipeLeft = useCallback(() => {
    pulseHaptic("light");
    setTrackIndex((index) =>
      tracks.length === 0 ? 0 : (index - 1 + tracks.length) % tracks.length,
    );
  }, [tracks.length]);

  const onSwipeRight = useCallback(() => {
    pulseHaptic("light");
    setTrackIndex((index) =>
      tracks.length === 0 ? 0 : (index + 1) % tracks.length,
    );
  }, [tracks.length]);

  const onSwipeUp = useCallback(() => {
    if (runPaused) return;
    pulseHaptic("light");
    setPaceFeedback(true);
    if (paceTimerRef.current) clearTimeout(paceTimerRef.current);
    paceTimerRef.current = setTimeout(() => {
      setPaceFeedback(false);
    }, PACE_FEEDBACK_MS);
  }, [runPaused]);

  const handlers = useMemo(
    () => ({
      onDoubleTap,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onLongPress: toggleRunPause,
    }),
    [onDoubleTap, onSwipeLeft, onSwipeRight, onSwipeUp, toggleRunPause],
  );

  const gesture = useRunGestures(handlers, !state.pocketGuardActive);

  const paceFeedbackText =
    !runPaused && paceFeedback
      ? `Target ${targetPace.value} ${targetPace.unit}`
      : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.phone}>
        <GestureDetector gesture={gesture}>
          <View style={styles.content} collapsable={false}>
            <View style={styles.header}>
              <View style={styles.headerStatus}>
                <View
                  style={runPaused ? styles.pausedDot : styles.statusDot}
                />
                <Text
                  style={[
                    styles.statusText,
                    runPaused && styles.statusTextPaused,
                  ]}
                  numberOfLines={1}
                >
                  {runPaused
                    ? `RUN PAUSED · ${audioMode.name}`
                    : `RUNNING · ${audioMode.name}`}
                </Text>
              </View>

              {/* Passive information indicator — not interactive. */}
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                pointerEvents="none"
                style={styles.bellIndicator}
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={RunColors.secondary}
                />
                {deferredCount > 0 ? (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>
                      {deferredCount > 9 ? "9+" : String(deferredCount)}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Researcher-only trigger — never shown/explained to participants. */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Research panel"
                onPress={() => setResearchPanelOpen(true)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.researchButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="flask-outline"
                  size={16}
                  color={RunColors.muted}
                />
              </Pressable>
            </View>

            {/*
              Stage: breathing space above metrics + quiet area below.
              Top flex > quiet flex places Pace in the upper-middle / center band.
            */}
            <View style={styles.metricsStage}>
              <View style={styles.stageBreathing} />

              <MetricsArea
                paceValue={currentPace.value}
                paceUnit={currentPace.unit}
                feedbackText={paceFeedbackText}
                target={targetPace.value}
                distance={`${MOCK_DISTANCE_KM.toFixed(1)} km`}
                time={formatDuration(MOCK_ELAPSED_SEC)}
                artworkColor={artworkColor}
                trackTitle={track.title}
                trackSubtitle={`${track.artist} · ${musicLabel}`}
              />

              <View style={styles.quietSpace}>
                {runPaused ? (
                  <Text style={styles.resumeHint}>Long press to resume</Text>
                ) : null}
              </View>
            </View>

            {/* Reserved bottom slot keeps metrics skeleton stable across states. */}
            <View style={styles.bottomSlot}>
              {runPaused ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Finish Run"
                  onPress={finishRun}
                  style={({ pressed }) => [
                    styles.finishButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.finishLabel}>Finish Run</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </GestureDetector>

        {activeOverlay ? <RunStatusOverlay kind={activeOverlay} /> : null}

        {state.smartAlertKind ? (
          <View pointerEvents="none" style={styles.smartToast}>
            <Ionicons
              name="time-outline"
              size={16}
              color={RunColors.secondary}
            />
            <Text style={styles.smartToastText} numberOfLines={2}>
              {EVENT_LABELS[state.smartAlertKind]} — delivered at a natural
              pause
            </Text>
          </View>
        ) : null}

        {paceSyncNotice ? (
          <View pointerEvents="none" style={styles.paceSyncToast}>
            <Ionicons
              name="musical-notes-outline"
              size={16}
              color={RunColors.secondary}
            />
            <Text style={styles.paceSyncToastText}>
              Music adapting to your pace
            </Text>
          </View>
        ) : null}
      </View>

      <ResearchPanel
        visible={researchPanelOpen}
        onClose={() => setResearchPanelOpen(false)}
        pocketGuardActive={state.pocketGuardActive}
        paceSyncState={state.paceSyncState}
        onTriggerEvent={(kind) => triggerEvent(kind, EVENT_LABELS[kind])}
        onSetPocketGuard={setPocketGuardActive}
        onSetPaceSyncState={setPaceSyncState}
        onRestoreToMusicFirst={restoreToMusicFirst}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: RunColors.bg,
    alignItems: "center",
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
    position: "relative",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 20,
  },
  headerStatus: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: RunColors.accent,
  },
  pausedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: RunColors.muted,
  },
  statusText: {
    flexShrink: 1,
    color: RunColors.secondary,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statusTextPaused: {
    color: RunColors.muted,
  },
  bellIndicator: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  bellBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: RunColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  bellBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 11,
  },
  metricsStage: {
    flex: 1,
    width: "100%",
  },
  /** Breathing room between header and metrics group. */
  stageBreathing: {
    flex: 1.2,
    minHeight: 32,
  },
  metricsArea: {
    width: "100%",
    alignItems: "center",
  },
  paceBlock: {
    width: "100%",
    alignItems: "center",
  },
  paceLabel: {
    width: "100%",
    color: RunColors.muted,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: 4,
    textAlign: "center",
  },
  paceValue: {
    width: "100%",
    color: RunColors.accent,
    fontSize: PACE_VALUE_SIZE,
    fontWeight: "700",
    lineHeight: PACE_VALUE_SIZE + 2,
    textAlign: "center",
  },
  paceUnit: {
    width: "100%",
    color: RunColors.accent,
    fontSize: 19,
    fontWeight: "600",
    lineHeight: 22,
    textAlign: "center",
  },
  paceFeedbackSlot: {
    width: "100%",
    minHeight: PACE_FEEDBACK_SLOT_HEIGHT,
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  paceFeedbackTarget: {
    color: RunColors.ink,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: 24,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    color: RunColors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    textAlign: "center",
  },
  statValue: {
    color: RunColors.ink,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  nowPlaying: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: RunColors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: RunColors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  trackMeta: {
    flex: 1,
    gap: 2,
  },
  trackTitle: {
    color: RunColors.ink,
    fontSize: 15,
    fontWeight: "600",
  },
  trackArtist: {
    color: RunColors.secondary,
    fontSize: 13,
    fontWeight: "400",
  },
  /**
   * Slightly less than stageBreathing so the Pace group sits in the
   * upper-middle / visual-center band, with quiet space remaining below.
   */
  quietSpace: {
    flex: 1,
    minHeight: 48,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  resumeHint: {
    color: RunColors.muted,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  bottomSlot: {
    width: "100%",
    minHeight: FINISH_SLOT_HEIGHT,
    justifyContent: "center",
  },
  finishButton: {
    minHeight: FINISH_SLOT_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RunColors.border,
    backgroundColor: RunColors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  finishLabel: {
    color: RunColors.secondary,
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.78,
  },
  researchButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: RunColors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: RunColors.border,
  },
  smartToast: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 96,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: RunColors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: RunColors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 15,
  },
  smartToastText: {
    flex: 1,
    color: RunColors.secondary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  paceSyncToast: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: RunColors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: RunColors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    zIndex: 15,
  },
  paceSyncToastText: {
    color: RunColors.secondary,
    fontSize: 12,
    fontWeight: "600",
  },
});
