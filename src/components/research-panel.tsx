import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { EventKind, PaceSyncState } from "@/types";

const PanelColors = {
  bg: "#0F1714",
  surface: "#1B2521",
  border: "#2C3833",
  ink: "#F5F7F4",
  secondary: "#B7C2BC",
  muted: "#7C8983",
  accent: "#00A87A",
  danger: "#C63838",
} as const;

const EVENT_BUTTONS: { kind: EventKind; label: string; hint: string }[] = [
  { kind: "safety", label: "Safety", hint: "Immediate" },
  { kind: "navigation", label: "Navigation", hint: "Immediate" },
  { kind: "workout", label: "Workout coaching", hint: "Smart timing" },
  { kind: "hydration", label: "Hydration", hint: "Smart timing" },
  { kind: "milestone", label: "Milestone", hint: "Deferred" },
  { kind: "routine", label: "Routine stat", hint: "Deferred" },
];

const EVENT_LABELS: Record<EventKind, string> = {
  safety: "Safety alert",
  navigation: "Navigation cue",
  workout: "Workout coaching tip",
  hydration: "Hydration reminder",
  milestone: "Distance milestone",
  routine: "Routine stat update",
};

type ResearchPanelProps = {
  visible: boolean;
  onClose: () => void;
  pocketGuardActive: boolean;
  paceSyncState: PaceSyncState;
  onTriggerEvent: (kind: EventKind) => void;
  onSetPocketGuard: (active: boolean) => void;
  onSetPaceSyncState: (state: PaceSyncState) => void;
  onRestoreToMusicFirst: () => void;
};

/**
 * Researcher-only control surface for live-triggering study events during a
 * Run session (Teammate Guide Tasks 4a-6b). Opened via a discreet icon that
 * is never part of the participant-facing gesture flow.
 */
export function ResearchPanel({
  visible,
  onClose,
  pocketGuardActive,
  paceSyncState,
  onTriggerEvent,
  onSetPocketGuard,
  onSetPaceSyncState,
  onRestoreToMusicFirst,
}: ResearchPanelProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Research Panel</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close research panel"
            onPress={onClose}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          >
            <Ionicons name="close" size={20} color={PanelColors.ink} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionLabel}>Trigger event (Task 4a-4c)</Text>
          <View style={styles.grid}>
            {EVENT_BUTTONS.map((item) => (
              <Pressable
                key={item.kind}
                accessibilityRole="button"
                accessibilityLabel={`Trigger ${item.label}`}
                onPress={() => onTriggerEvent(item.kind)}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardHint}>{item.hint}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Pace Sync (Task 5)</Text>
          <View style={styles.segmentRow}>
            {(
              [
                { id: "too_slow" as const, label: "Too slow" },
                { id: "on_target" as const, label: "On target" },
                { id: "too_fast" as const, label: "Too fast" },
              ]
            ).map((option) => {
              const selected = paceSyncState === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onSetPaceSyncState(option.id)}
                  style={({ pressed }) => [
                    styles.segment,
                    selected && styles.segmentSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentLabel,
                      selected && styles.segmentLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Pocket Guard (Task 6a-6b)</Text>
          <View style={styles.segmentRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: !pocketGuardActive }}
              onPress={() => onSetPocketGuard(false)}
              style={({ pressed }) => [
                styles.segment,
                !pocketGuardActive && styles.segmentSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  !pocketGuardActive && styles.segmentLabelSelected,
                ]}
              >
                In hand
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: pocketGuardActive }}
              onPress={() => onSetPocketGuard(true)}
              style={({ pressed }) => [
                styles.segment,
                pocketGuardActive && styles.segmentSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  pocketGuardActive && styles.segmentLabelSelected,
                ]}
              >
                In pocket
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Mandatory restore (before Task 6a)</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onRestoreToMusicFirst}
            style={({ pressed }) => [styles.restoreButton, pressed && styles.pressed]}
          >
            <Text style={styles.restoreLabel}>
              Restore Music First + on-target pace
            </Text>
          </Pressable>
          <Text style={styles.footnote}>
            Restore keeps the deferred queue intact — it never clears the
            Task 4c Milestone.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export { EVENT_LABELS };

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PanelColors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    color: PanelColors.ink,
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PanelColors.surface,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionLabel: {
    marginTop: 24,
    marginBottom: 10,
    color: PanelColors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  card: {
    width: "48%",
    minHeight: 64,
    backgroundColor: PanelColors.surface,
    borderWidth: 1,
    borderColor: PanelColors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  cardTitle: {
    color: PanelColors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  cardHint: {
    color: PanelColors.muted,
    fontSize: 11,
    fontWeight: "500",
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PanelColors.surface,
    borderWidth: 1,
    borderColor: PanelColors.border,
    borderRadius: 10,
  },
  segmentSelected: {
    borderColor: PanelColors.accent,
    backgroundColor: "#0E332A",
  },
  segmentLabel: {
    color: PanelColors.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  segmentLabelSelected: {
    color: PanelColors.accent,
  },
  restoreButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PanelColors.danger,
  },
  restoreLabel: {
    color: PanelColors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  footnote: {
    marginTop: 8,
    color: PanelColors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.8,
  },
});
