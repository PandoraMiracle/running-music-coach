import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { InfoCard } from "@/components/info-card";
import { PolicyList } from "@/components/policy-list";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenScaffold } from "@/components/screen-scaffold";
import { ROUTES } from "@/constants/routes";
import { Palette } from "@/constants/theme";
import { AUDIO_MODE_PRESETS } from "@/features/audioMode";
import { DEFAULT_AUDIO_MODE } from "@/store/defaults";

export default function AudioModeScreen() {
  return (
    <ScreenScaffold
      title="Audio Mode"
      subtitle="Three presets control how interruptions land while music keeps playing."
      footer={
        <>
          <PrimaryButton
            label="Continue to Ready"
            onPress={() => router.push(ROUTES.ready)}
          />
          <Pressable onPress={() => router.push(ROUTES.customAudioMode)}>
            <Text style={styles.customLink}>Open Custom Mode editor</Text>
          </Pressable>
        </>
      }
    >
      {AUDIO_MODE_PRESETS.map((mode) => (
        <InfoCard
          key={mode.id}
          title={mode.name}
          subtitle={mode.description}
          meta={
            mode.paceSyncEnabled
              ? `Pace Sync on · ${mode.adaptation ?? "normal"}`
              : "Pace Sync off"
          }
          selected={mode.id === DEFAULT_AUDIO_MODE.id}
        >
          <PolicyList policies={mode.policies} />
        </InfoCard>
      ))}

      <InfoCard
        title="Custom Modes"
        subtitle="Name a mode and set each event to Immediate, Smart timing, or Deferred."
        badge="Editor"
        onPress={() => router.push(ROUTES.customAudioMode)}
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  customLink: {
    color: Palette.muted,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
});
