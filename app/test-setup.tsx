import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { InfoCard } from "@/components/info-card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenScaffold } from "@/components/screen-scaffold";
import { ROUTES } from "@/constants/routes";
import { Palette } from "@/constants/theme";

const CONDITIONS = [
  { id: "walk", name: "Walk", detail: "Familiarization and low-motion baseline." },
  { id: "jog", name: "Jog", detail: "Main summative condition for measured tasks." },
  { id: "run", name: "Run", detail: "Short stress test with stronger movement." },
] as const;

const SCENARIOS = [
  { id: "normal", name: "Normal" },
  { id: "pace_mismatch", name: "Pace mismatch" },
  { id: "routine_interruption", name: "Routine interruption" },
  { id: "safety_interruption", name: "Safety interruption" },
] as const;

export default function TestSetupScreen() {
  return (
    <ScreenScaffold
      title="Test Setup"
      subtitle="Research and debug only. This screen is not part of the consumer product."
      badge="Research"
      hideBack
      footer={
        <PrimaryButton
          label="Start Prototype"
          onPress={() => router.replace(ROUTES.home)}
        />
      }
    >
      <Text style={styles.section}>Movement condition</Text>
      {CONDITIONS.map((condition) => (
        <InfoCard
          key={condition.id}
          title={condition.name}
          subtitle={condition.detail}
          selected={condition.id === "jog"}
          badge={condition.id === "jog" ? "Default" : undefined}
        />
      ))}

      <Text style={styles.section}>Scenario seed</Text>
      <View style={styles.seedGrid}>
        {SCENARIOS.map((scenario) => (
          <View
            key={scenario.id}
            style={[
              styles.seed,
              scenario.id === "normal" && styles.seedSelected,
            ]}
          >
            <Text
              style={[
                styles.seedLabel,
                scenario.id === "normal" && styles.seedLabelSelected,
              ]}
            >
              {scenario.name}
            </Text>
          </View>
        ))}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  section: {
    color: Palette.muted,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 8,
  },
  seedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  seed: {
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    backgroundColor: Palette.card,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  seedSelected: {
    borderColor: Palette.accent,
    backgroundColor: Palette.accentDim,
  },
  seedLabel: {
    color: Palette.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  seedLabelSelected: {
    color: Palette.accent,
  },
});
