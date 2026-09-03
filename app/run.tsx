import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

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

export default function RunScreen() {
  const track = DEFAULT_PLAYLIST.tracks[0];

  return (
    <ScreenScaffold
      title="Running"
      subtitle="Static preview. Gestures, music, and study states come in later phases."
      footer={
        <PrimaryButton
          label="Finish Run"
          onPress={() => router.replace(ROUTES.summary)}
        />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.status}>RUN STATUS · RUNNING</Text>
        <Text style={styles.pace}>{formatPace(368)}</Text>
        <Text style={styles.paceLabel}>
          Current pace · target {formatPace(DEFAULT_PLAN.targetPaceSecPerKm)}
        </Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>1.6 km</Text>
          <Text style={styles.metricLabel}>Distance</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>9:42</Text>
          <Text style={styles.metricLabel}>Time</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{DEFAULT_AUDIO_MODE.name}</Text>
          <Text style={styles.metricLabel}>Audio Mode</Text>
        </View>
      </View>

      <View style={styles.trackCard}>
        <Text style={styles.trackKicker}>Now playing</Text>
        <Text style={styles.trackTitle}>{track.title}</Text>
        <Text style={styles.trackMeta}>
          {track.artist} · {track.bpm} BPM · Music playing
        </Text>
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: Palette.card,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  status: {
    color: Palette.accent,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  pace: {
    color: Palette.text,
    fontSize: 44,
    fontWeight: "700",
  },
  paceLabel: {
    color: Palette.muted,
    fontSize: 14,
  },
  metrics: {
    flexDirection: "row",
    gap: 8,
  },
  metric: {
    flex: 1,
    backgroundColor: Palette.bgElevated,
    borderRadius: 16,
    padding: 12,
  },
  metricValue: {
    color: Palette.text,
    fontSize: 15,
    fontWeight: "700",
  },
  metricLabel: {
    color: Palette.muted,
    fontSize: 12,
    marginTop: 4,
  },
  trackCard: {
    backgroundColor: Palette.card,
    borderRadius: 18,
    padding: 16,
    gap: 4,
  },
  trackKicker: {
    color: Palette.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  trackTitle: {
    color: Palette.text,
    fontSize: 18,
    fontWeight: "700",
  },
  trackMeta: {
    color: Palette.muted,
    fontSize: 13,
  },
});
