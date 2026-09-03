import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

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

export default function SummaryScreen() {
  return (
    <ScreenScaffold
      title="Run Summary"
      subtitle="Static completion preview. Deferred updates stay on this screen."
      hideBack
      footer={
        <>
          <PrimaryButton
            label="Done"
            onPress={() => router.replace(ROUTES.home)}
          />
          <Pressable>
            <Text style={styles.deferred}>View Deferred Updates (2 saved)</Text>
          </Pressable>
        </>
      }
    >
      <InfoCard title="28:14" subtitle="Duration" />
      <InfoCard title="5.0 km" subtitle="Distance" />
      <InfoCard
        title={formatPace(339)}
        subtitle={`Average pace · target ${formatPace(DEFAULT_PLAN.targetPaceSecPerKm)}`}
      />
      <InfoCard title={DEFAULT_PLAYLIST.title} subtitle="Playlist" />
      <InfoCard
        title={DEFAULT_AUDIO_MODE.name}
        subtitle={DEFAULT_AUDIO_MODE.paceSyncEnabled ? "Pace Sync on" : "Pace Sync off"}
        meta="No tempo adjustments in this static preview"
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  deferred: {
    color: Palette.blue,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
});
