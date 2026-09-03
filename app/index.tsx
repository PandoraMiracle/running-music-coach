import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { InfoCard } from "@/components/info-card";
import { PrimaryButton } from "@/components/primary-button";
import { ScreenScaffold } from "@/components/screen-scaffold";
import { formatPace } from "@/constants/format";
import { ROUTES } from "@/constants/routes";
import { Palette } from "@/constants/theme";
import {
  DEFAULT_AUDIO_MODE,
  DEFAULT_PLAN,
  DEFAULT_PLAYLIST,
} from "@/store/defaults";

export default function HomeScreen() {
  return (
    <ScreenScaffold
      title="Running Music Coach"
      subtitle="Keep music flow, control tracks without aiming, and try adaptive pace music."
      hideBack
      footer={
        <View style={styles.footer}>
          <PrimaryButton
            label="Prepare Run"
            onPress={() => router.push(ROUTES.plan)}
          />
          <Pressable onPress={() => router.push(ROUTES.testSetup)}>
            <Text style={styles.researchLink}>Research Test Setup</Text>
          </Pressable>
        </View>
      }
    >
      <Text style={styles.section}>Upcoming run</Text>
      <InfoCard
        title={DEFAULT_PLAN.name}
        subtitle={DEFAULT_PLAN.description}
        meta={`${formatPace(DEFAULT_PLAN.targetPaceSecPerKm)} · ${DEFAULT_PLAN.distanceKm} km`}
        selected
      />

      <Text style={styles.section}>Playlist</Text>
      <InfoCard
        title={DEFAULT_PLAYLIST.title}
        meta={`${DEFAULT_PLAYLIST.tracks.length} tracks · ~${DEFAULT_PLAYLIST.approxBpm} BPM`}
      />

      <Text style={styles.section}>Audio Mode</Text>
      <InfoCard
        title={DEFAULT_AUDIO_MODE.name}
        subtitle={DEFAULT_AUDIO_MODE.description}
        meta={DEFAULT_AUDIO_MODE.paceSyncEnabled ? "Pace Sync on" : "Pace Sync off"}
      />
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
  footer: {
    gap: 12,
    alignItems: "center",
  },
  researchLink: {
    color: Palette.muted,
    fontSize: 13,
    fontWeight: "600",
  },
});
