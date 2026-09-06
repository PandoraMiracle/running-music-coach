import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { ROUTES } from "@/constants/routes";
import { Spacing } from "@/constants/theme";
import { useSession } from "@/store/session-store";
import type { MovementCondition, ScenarioSeed } from "@/types";

const ResearchColors = {
  bg: "#F5F7F4",
  surface: "#FFFFFF",
  surfaceMuted: "#EEF1EE",
  surfaceSelected: "#E6F6F0",
  border: "#D7DED8",
  borderSelected: "#00A87A",
  ink: "#0F1714",
  secondary: "#47544F",
  muted: "#73807A",
  accent: "#00A87A",
  research: "#8A5A12",
  researchBg: "#F7EEDF",
} as const;

const MOVEMENT_OPTIONS: {
  id: MovementCondition;
  name: string;
  role: string;
}[] = [
  { id: "walk", name: "Walk", role: "Familiarization" },
  { id: "jog", name: "Jog", role: "Main measured" },
  { id: "run", name: "Run", role: "Stress-test subset" },
];

const SCENARIO_OPTIONS: {
  id: ScenarioSeed;
  name: string;
}[] = [
  { id: "normal", name: "Normal" },
  { id: "pace_mismatch", name: "Pace mismatch" },
  { id: "routine_interruption", name: "Routine interruption" },
  { id: "safety_interruption", name: "Safety interruption" },
];

export default function TestSetupScreen() {
  const {
    state,
    setMovementCondition,
    setScenarioSeed,
  } = useSession();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.phone}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Test Setup</Text>
          <View style={styles.researchBadge}>
            <Text style={styles.researchBadgeText}>Research only</Text>
          </View>
          <Text style={styles.subtitle}>
            Configure the study condition before starting the prototype.
          </Text>

          <Text style={styles.sectionLabel}>Movement condition</Text>
          <View style={styles.segmentRow}>
            {MOVEMENT_OPTIONS.map((option) => {
              const selected = state.movementCondition === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${option.name}. ${option.role}`}
                  onPress={() => setMovementCondition(option.id)}
                  style={({ pressed }) => [
                    styles.segment,
                    selected && styles.segmentSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.segmentHeader}>
                    <Text
                      style={[
                        styles.segmentTitle,
                        selected && styles.segmentTitleSelected,
                      ]}
                    >
                      {option.name}
                    </Text>
                    {selected ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={ResearchColors.accent}
                      />
                    ) : null}
                  </View>
                  <Text
                    style={[
                      styles.segmentMeta,
                      selected && styles.segmentMetaSelected,
                    ]}
                  >
                    {option.role}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Scenario seed (optional)</Text>
          <View style={styles.seedList}>
            {SCENARIO_OPTIONS.map((option) => {
              const selected = state.scenarioSeed === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={option.name}
                  onPress={() => setScenarioSeed(option.id)}
                  style={({ pressed }) => [
                    styles.seedRow,
                    selected && styles.seedRowSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.seedTitle,
                      selected && styles.seedTitleSelected,
                    ]}
                  >
                    {option.name}
                  </Text>
                  {selected ? (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={ResearchColors.accent}
                    />
                  ) : (
                    <View style={styles.seedPlaceholder} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <PrimaryButton
            label="Start Prototype"
            onPress={() => router.replace(ROUTES.home)}
            style={styles.startButton}
          />

          <View style={styles.noteBlock}>
            <Text style={styles.noteLabel}>Study sequence</Text>
            <Text style={styles.noteLine}>Walk → familiarization</Text>
            <Text style={styles.noteLine}>Jog → main measured tasks</Text>
            <Text style={styles.noteLine}>
              Run → short stress-test subset
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: ResearchColors.bg,
    alignItems: "center",
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  title: {
    color: ResearchColors.ink,
    fontSize: 28,
    fontWeight: "700",
  },
  researchBadge: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: ResearchColors.researchBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  researchBadgeText: {
    color: ResearchColors.research,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  subtitle: {
    marginTop: 10,
    color: ResearchColors.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionLabel: {
    marginTop: 28,
    marginBottom: 10,
    color: ResearchColors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  segment: {
    flex: 1,
    minHeight: 72,
    backgroundColor: ResearchColors.surface,
    borderWidth: 1,
    borderColor: ResearchColors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 4,
  },
  segmentSelected: {
    backgroundColor: ResearchColors.surfaceSelected,
    borderColor: ResearchColors.borderSelected,
  },
  segmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  segmentTitle: {
    color: ResearchColors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  segmentTitleSelected: {
    color: ResearchColors.accent,
  },
  segmentMeta: {
    color: ResearchColors.muted,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
  },
  segmentMetaSelected: {
    color: ResearchColors.secondary,
  },
  seedList: {
    gap: 8,
  },
  seedRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: ResearchColors.surface,
    borderWidth: 1,
    borderColor: ResearchColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  seedRowSelected: {
    backgroundColor: ResearchColors.surfaceSelected,
    borderColor: ResearchColors.borderSelected,
  },
  seedTitle: {
    color: ResearchColors.ink,
    fontSize: 15,
    fontWeight: "600",
  },
  seedTitleSelected: {
    color: ResearchColors.accent,
    fontWeight: "700",
  },
  seedPlaceholder: {
    width: 18,
    height: 18,
  },
  startButton: {
    marginTop: 28,
  },
  noteBlock: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ResearchColors.border,
    gap: 4,
  },
  noteLabel: {
    color: ResearchColors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  noteLine: {
    color: ResearchColors.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.82,
  },
});
