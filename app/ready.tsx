import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { formatPace } from "@/constants/format";
import { ROUTES } from "@/constants/routes";
import { Spacing } from "@/constants/theme";
import { RUN_TYPES } from "@/data/runTypes";
import { useSession } from "@/store/session-store";

const ReadyColors = {
  bg: "#F5F7F4",
  surface: "#FFFFFF",
  border: "#E4E9E4",
  ink: "#0F1714",
  secondary: "#47544F",
  muted: "#73807A",
  accent: "#00A87A",
} as const;

const ARTWORK_COLORS: Record<string, string> = {
  "morning-momentum": "#1A7360",
  "easy-groove": "#3D6B8C",
  "race-focus": "#B45A3C",
  "night-run": "#3A4560",
  "recovery-mix": "#6B7A4A",
};

const GESTURES = [
  { action: "Double tap", detail: "pause / resume music" },
  { action: "Swipe up", detail: "current pace" },
  { action: "Swipe", detail: "previous / next track" },
  { action: "Long press", detail: "pause / resume run" },
] as const;

function paceParts(secPerKm: number) {
  const formatted = formatPace(secPerKm);
  return {
    value: formatted.replace("/km", "").trim(),
    unit: "/km",
  };
}

export default function ReadyScreen() {
  const { state, playlist, audioMode } = useSession();

  const runType =
    RUN_TYPES.find((item) => item.id === state.runTypeId) ?? RUN_TYPES[0];
  const pace = paceParts(state.targetPaceSecPerKm);
  const isCustomMode = state.customModes.some(
    (mode) => mode.id === state.audioModeId,
  );
  const artworkColor =
    ARTWORK_COLORS[playlist.id] ?? ReadyColors.accent;
  const audioMeta = isCustomMode
    ? `Custom · Pace Sync ${audioMode.paceSyncEnabled ? "on" : "off"}`
    : `Pace Sync ${audioMode.paceSyncEnabled ? "on" : "off"}`;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.phone}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Ready to Run</Text>
          <Text style={styles.subtitle}>One glance. Then go.</Text>

          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>Run type</Text>
            <Text style={styles.runType}>{runType.name}</Text>

            <View style={styles.paceBlock}>
              <View style={styles.paceRow}>
                <Text style={styles.paceValue}>{pace.value}</Text>
                <Text style={styles.paceUnit}>{pace.unit}</Text>
              </View>
              <Text style={styles.paceMeta}>
                {`Target pace · ${state.distanceKm.toFixed(1)} km`}
              </Text>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.playlistRow}>
              <View
                style={[styles.artwork, { backgroundColor: artworkColor }]}
              />
              <View style={styles.playlistMeta}>
                <Text style={styles.rowTitle}>{playlist.title}</Text>
                <Text style={styles.rowMeta}>
                  {`${playlist.tracks.length} tracks · ~${playlist.approxBpm} BPM`}
                </Text>
              </View>
            </View>

            <View style={styles.audioBlock}>
              <Text style={styles.rowTitle}>{audioMode.name}</Text>
              <Text style={styles.rowMeta}>{audioMeta}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>While running</Text>
          <View style={styles.gestureList}>
            {GESTURES.map((gesture) => (
              <Text key={gesture.action} style={styles.gestureLine}>
                <Text style={styles.gestureAction}>{gesture.action}</Text>
                {" — "}
                {gesture.detail}
              </Text>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="Start Run"
            onPress={() => router.push(ROUTES.run)}
            style={styles.cta}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: ReadyColors.bg,
    alignItems: "center",
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  title: {
    color: ReadyColors.ink,
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: ReadyColors.secondary,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: ReadyColors.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ReadyColors.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  cardLabel: {
    color: ReadyColors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  runType: {
    color: ReadyColors.ink,
    fontSize: 17,
    fontWeight: "700",
  },
  paceBlock: {
    marginTop: 14,
  },
  paceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  paceValue: {
    color: ReadyColors.ink,
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 40,
  },
  paceUnit: {
    color: ReadyColors.secondary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    marginLeft: 2,
  },
  paceMeta: {
    color: ReadyColors.secondary,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: ReadyColors.border,
    marginVertical: 14,
  },
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  playlistMeta: {
    flex: 1,
    gap: 2,
  },
  audioBlock: {
    marginTop: 14,
    gap: 2,
  },
  rowTitle: {
    color: ReadyColors.ink,
    fontSize: 15,
    fontWeight: "600",
  },
  rowMeta: {
    color: ReadyColors.secondary,
    fontSize: 13,
    fontWeight: "400",
  },
  sectionLabel: {
    color: ReadyColors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 10,
  },
  gestureList: {
    gap: 6,
  },
  gestureLine: {
    color: ReadyColors.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  gestureAction: {
    color: ReadyColors.ink,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  cta: {
    width: "100%",
    alignSelf: "stretch",
    minHeight: 56,
    borderRadius: 16,
  },
});
