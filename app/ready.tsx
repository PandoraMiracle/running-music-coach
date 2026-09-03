import { router } from "expo-router";
import { StyleSheet, Text } from "react-native";

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

const GESTURE_REMINDERS = [
  "Double tap anywhere — pause or resume music",
  "Long press anywhere — hear current pace",
  "Swipe left or right — previous or next track",
];

export default function ReadyScreen() {
  return (
    <ScreenScaffold
      title="Ready to Run"
      subtitle="Confirm the session, then start. Gestures work on the run screen."
      footer={
        <PrimaryButton
          label="Start Run"
          onPress={() => router.push(ROUTES.run)}
        />
      }
    >
      <InfoCard
        title={DEFAULT_PLAN.name}
        meta={`${formatPace(DEFAULT_PLAN.targetPaceSecPerKm)} · ${DEFAULT_PLAN.distanceKm} km`}
      />
      <InfoCard
        title={DEFAULT_PLAYLIST.title}
        meta={`${DEFAULT_PLAYLIST.tracks.length} tracks · ~${DEFAULT_PLAYLIST.approxBpm} BPM`}
      />
      <InfoCard
        title={DEFAULT_AUDIO_MODE.name}
        subtitle={DEFAULT_AUDIO_MODE.description}
        meta={DEFAULT_AUDIO_MODE.paceSyncEnabled ? "Pace Sync on" : "Pace Sync off"}
      />

      <Text style={styles.section}>Gesture reminder</Text>
      {GESTURE_REMINDERS.map((line) => (
        <Text key={line} style={styles.reminder}>
          {line}
        </Text>
      ))}
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
  reminder: {
    color: Palette.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
