import { useCallback, useState, type ReactNode } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { ROUTES } from "@/constants/routes";
import { DEFAULT_AUDIO_MODE } from "@/store/defaults";
import { useSession } from "@/store/session-store";

const PACE_SYNC_MODE_ID = "pace-sync";
const MUSIC_FIRST_MODE_ID = DEFAULT_AUDIO_MODE.id; // "music-first"

const PanelColors = {
  bg: "#1A1F1C",
  surface: "#2A312D",
  border: "#3D4641",
  ink: "#F2F5F3",
  muted: "#9AA59E",
  accent: "#D4A017",
  accentBg: "#3A3218",
  button: "#3A4540",
  buttonPressed: "#4A5751",
  danger: "#E07070",
  dangerBg: "#3A2222",
} as const;

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  tone?: "default" | "accent" | "danger";
};

function ActionButton({ label, onPress, tone = "default" }: ActionButtonProps) {
  const toneStyle =
    tone === "accent"
      ? styles.btnAccent
      : tone === "danger"
        ? styles.btnDanger
        : styles.btnDefault;
  const labelStyle =
    tone === "accent"
      ? styles.btnLabelAccent
      : tone === "danger"
        ? styles.btnLabelDanger
        : styles.btnLabel;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        toneStyle,
        pressed && styles.btnPressed,
      ]}
    >
      <Text style={labelStyle}>{label}</Text>
    </Pressable>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

/**
 * Research-only facilitator panel for solo study sessions.
 * Must stay mounted with /run — does not remount the run screen.
 */
export function ResearchControlPanel() {
  const [open, setOpen] = useState(false);
  const {
    state,
    audioMode,
    triggerImmediateEvent,
    triggerSmartTimingEvent,
    triggerMilestone,
    setAudioMode,
    setPaceCondition,
    setDeviceCondition,
    setMovementCondition,
    resetScenario,
    resetPrototype,
  } = useSession();

  const close = useCallback(() => setOpen(false), []);

  const runAndClose = useCallback(
    (action: () => void) => {
      action();
      close();
    },
    [close],
  );

  const movementLabel =
    state.movementCondition === "walk"
      ? "Walk"
      : state.movementCondition === "run"
        ? "Run"
        : "Jog";

  const audioLabel = audioMode.paceSyncEnabled ? "Pace Sync" : audioMode.name;

  const deviceLabel =
    state.deviceCondition === "in_pocket" ? "In pocket" : "In hand";

  const paceLabel =
    state.paceCondition === "too_slow"
      ? "Too slow"
      : state.paceCondition === "too_fast"
        ? "Too fast"
        : "On target";

  const immediateLabel =
    state.activeImmediateEvent === "safety"
      ? "safety"
      : state.activeImmediateEvent === "navigation"
        ? "navigation"
        : "none";

  const smartLabel =
    state.pendingSmartTimingEvent?.kind === "important_coaching"
      ? "coaching (pending)"
      : state.pendingSmartTimingEvent?.kind === "hydration"
        ? "hydration (pending)"
        : "none";

  const confirmReset = useCallback(() => {
    Alert.alert(
      "Reset Scenario?",
      "Clears deferred queue, Immediate/Smart events, device, pace, and restores Music First + Jog. Keeps the current run plan/session.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetScenario();
            close();
          },
        },
      ],
    );
  }, [resetScenario, close]);

  const confirmNextParticipant = useCallback(() => {
    Alert.alert(
      "End this participant session and reset the prototype?",
      "Restores full project defaults and returns to Research Test Setup. Deferred queue and all study state will be cleared.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Next participant",
          style: "destructive",
          onPress: () => {
            resetPrototype();
            close();
            router.replace(ROUTES.testSetup);
          },
        },
      ],
    );
  }, [resetPrototype, close]);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open research controls"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        hitSlop={8}
      >
        <Text style={styles.fabText}>R</Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={close}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close research controls"
            style={styles.backdrop}
            onPress={close}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Research Control</Text>
                <Text style={styles.researchBadge}>RESEARCH ONLY</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={close}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Section title="Study status">
                <View style={styles.statusCard}>
                  <StatusRow label="Movement" value={movementLabel} />
                  <StatusRow label="Audio" value={audioLabel} />
                  <StatusRow label="Device" value={deviceLabel} />
                  <StatusRow label="Pace" value={paceLabel} />
                  <StatusRow
                    label="Deferred"
                    value={`${state.deferredUpdates.length} saved`}
                  />
                  <StatusRow label="Immediate" value={immediateLabel} />
                  <StatusRow label="Smart" value={smartLabel} />
                </View>
              </Section>

              <Section title="Task 4a — Immediate">
                <View style={styles.row}>
                  <ActionButton
                    label="Safety"
                    onPress={() =>
                      runAndClose(() => triggerImmediateEvent("safety"))
                    }
                  />
                  <ActionButton
                    label="Navigation"
                    onPress={() =>
                      runAndClose(() => triggerImmediateEvent("navigation"))
                    }
                  />
                </View>
              </Section>

              <Section title="Task 4b — Smart Timing">
                <View style={styles.row}>
                  <ActionButton
                    label="Coaching"
                    onPress={() =>
                      runAndClose(() =>
                        triggerSmartTimingEvent("important_coaching"),
                      )
                    }
                  />
                  <ActionButton
                    label="Hydration"
                    onPress={() =>
                      runAndClose(() => triggerSmartTimingEvent("hydration"))
                    }
                  />
                </View>
              </Section>

              <Section title="Task 4c — Deferred">
                <ActionButton
                  label="Milestone"
                  onPress={() => runAndClose(() => triggerMilestone())}
                />
              </Section>

              <Section title="Task 5 — Pace Sync">
                <View style={styles.row}>
                  <ActionButton
                    label="Too slow"
                    tone="accent"
                    onPress={() =>
                      runAndClose(() => {
                        setAudioMode(PACE_SYNC_MODE_ID);
                        setPaceCondition("too_slow");
                      })
                    }
                  />
                  <ActionButton
                    label="Too fast"
                    tone="accent"
                    onPress={() =>
                      runAndClose(() => {
                        setAudioMode(PACE_SYNC_MODE_ID);
                        setPaceCondition("too_fast");
                      })
                    }
                  />
                </View>
                <ActionButton
                  label="Restore Music First"
                  onPress={() =>
                    runAndClose(() => {
                      setAudioMode(MUSIC_FIRST_MODE_ID);
                      setPaceCondition("on_target");
                    })
                  }
                />
              </Section>

              <Section title="Task 6 — Pocket Guard">
                <View style={styles.row}>
                  <ActionButton
                    label="6a In pocket"
                    onPress={() =>
                      runAndClose(() => setDeviceCondition("in_pocket"))
                    }
                  />
                  <ActionButton
                    label="6b In hand"
                    onPress={() =>
                      runAndClose(() => setDeviceCondition("in_hand"))
                    }
                  />
                </View>
              </Section>

              <Section title="Task 2R — Run stress">
                <ActionButton
                  label="Movement → Run"
                  onPress={() =>
                    runAndClose(() => setMovementCondition("run"))
                  }
                />
              </Section>

              <Section title="Session">
                <ActionButton
                  label="RESET SCENARIO"
                  tone="danger"
                  onPress={confirmReset}
                />
                <ActionButton
                  label="NEXT PARTICIPANT / RESET PROTOTYPE"
                  tone="danger"
                  onPress={confirmNextParticipant}
                />
              </Section>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 10,
    bottom: 14,
    zIndex: 40,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: PanelColors.accentBg,
    borderWidth: 1,
    borderColor: PanelColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  fabPressed: {
    opacity: 0.85,
  },
  fabText: {
    color: PanelColors.accent,
    fontSize: 14,
    fontWeight: "800",
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    maxHeight: "78%",
    backgroundColor: PanelColors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: PanelColors.border,
    paddingBottom: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PanelColors.border,
  },
  sheetTitle: {
    color: PanelColors.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  researchBadge: {
    marginTop: 4,
    color: PanelColors.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  closeBtnText: {
    color: PanelColors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 14,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: PanelColors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  btn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
  },
  btnDefault: {
    backgroundColor: PanelColors.button,
    borderColor: PanelColors.border,
  },
  btnAccent: {
    backgroundColor: PanelColors.accentBg,
    borderColor: PanelColors.accent,
  },
  btnDanger: {
    backgroundColor: PanelColors.dangerBg,
    borderColor: PanelColors.danger,
  },
  btnPressed: {
    opacity: 0.88,
  },
  btnLabel: {
    color: PanelColors.ink,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  btnLabelAccent: {
    color: PanelColors.accent,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  btnLabelDanger: {
    color: PanelColors.danger,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  statusCard: {
    backgroundColor: PanelColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PanelColors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statusLabel: {
    color: PanelColors.muted,
    fontSize: 12,
    fontWeight: "500",
  },
  statusValue: {
    color: PanelColors.ink,
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },
});
