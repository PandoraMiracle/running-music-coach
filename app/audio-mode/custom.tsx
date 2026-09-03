import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { ScreenScaffold } from "@/components/screen-scaffold";
import { ROUTES } from "@/constants/routes";
import { Palette } from "@/constants/theme";

const FIELDS = [
  { label: "Mode name", value: "Race Focus" },
  { label: "Safety alerts", value: "Immediate" },
  { label: "Navigation", value: "Immediate" },
  { label: "Workout guidance", value: "Smart timing" },
  { label: "Hydration", value: "Smart timing" },
  { label: "Milestones", value: "Deferred" },
  { label: "Routine stats", value: "Deferred" },
  { label: "Pace Sync", value: "ON" },
  { label: "Adaptation strength", value: "Gentle" },
];

export default function CustomAudioModeScreen() {
  return (
    <ScreenScaffold
      title="Custom Mode"
      subtitle="Session-only editor. Saving and selection land in the next phase."
      footer={
        <PrimaryButton
          label="Back to Audio Modes"
          onPress={() => router.replace(ROUTES.audioMode)}
        />
      }
    >
      {FIELDS.map((field) => (
        <View key={field.label} style={styles.row}>
          <Text style={styles.label}>{field.label}</Text>
          <Text style={styles.value}>{field.value}</Text>
        </View>
      ))}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: Palette.card,
    borderColor: Palette.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    color: Palette.muted,
    fontSize: 14,
    flex: 1,
  },
  value: {
    color: Palette.text,
    fontSize: 14,
    fontWeight: "700",
  },
});
