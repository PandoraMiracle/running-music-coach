import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { formatDuration, formatPace } from "@/constants/format";
import { ROUTES } from "@/constants/routes";
import { Spacing } from "@/constants/theme";
import { RUN_TYPES } from "@/data/runTypes";
import { useSession } from "@/store/session-store";

const SummaryColors = {
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

/**
 * Temporary post-run mocks until Phase E run-completion metrics exist.
 * Deferred list length is the source of the count (not a separate hardcoded number).
 */
const MOCK_DURATION_SEC = 28 * 60 + 14;
const MOCK_AVG_PACE_SEC = 339; // 5:39 /km
const MOCK_DEFERRED_UPDATES = [
  "1.5 km milestone",
  "Cadence consistency tip",
] as const;

function paceValue(secPerKm: number) {
  return formatPace(secPerKm).replace("/km", "").trim();
}

export default function SummaryScreen() {
  const { state, playlist, audioMode } = useSession();

  const runType =
    RUN_TYPES.find((item) => item.id === state.runTypeId) ?? RUN_TYPES[0];
  const artworkColor =
    ARTWORK_COLORS[playlist.id] ?? SummaryColors.accent;
  const paceSyncLabel = audioMode.paceSyncEnabled
    ? "Pace Sync on"
    : "Pace Sync off";
  const deferredUpdates = MOCK_DEFERRED_UPDATES;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.phone}>
        <View style={styles.content}>
          <Text style={styles.title}>Run Summary</Text>
          <Text style={styles.subtitle}>{`${runType.name} complete`}</Text>

          <View style={styles.resultCard}>
            <Text style={styles.distance}>
              {`${state.distanceKm.toFixed(1)} km`}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>
                  {formatDuration(MOCK_DURATION_SEC)}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Avg pace</Text>
                <Text style={styles.statValue}>
                  {paceValue(MOCK_AVG_PACE_SEC)}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Target</Text>
                <Text style={styles.statValue}>
                  {paceValue(state.targetPaceSecPerKm)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.mediaRow}>
            <View
              style={[styles.artwork, { backgroundColor: artworkColor }]}
            />
            <View style={styles.mediaMeta}>
              <Text style={styles.mediaTitle} numberOfLines={1}>
                {playlist.title}
              </Text>
              <Text style={styles.mediaSubtitle} numberOfLines={1}>
                {`${audioMode.name} · ${paceSyncLabel}`}
              </Text>
            </View>
          </View>

          <View style={styles.deferredCard}>
            <View style={styles.deferredHeader}>
              <Text style={styles.deferredTitle}>Deferred updates</Text>
              <Text style={styles.deferredCount}>
                {deferredUpdates.length}
              </Text>
            </View>
            {deferredUpdates.map((item) => (
              <Text key={item} style={styles.deferredItem}>
                {item}
              </Text>
            ))}
          </View>

          <View style={styles.flexSpace} />

          <PrimaryButton
            label="Done"
            onPress={() => router.replace(ROUTES.home)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SummaryColors.bg,
    alignItems: "center",
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  title: {
    color: SummaryColors.ink,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: SummaryColors.secondary,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: SummaryColors.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SummaryColors.border,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 18,
  },
  distance: {
    color: SummaryColors.ink,
    fontSize: 40,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 44,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 18,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    color: SummaryColors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    textAlign: "center",
  },
  statValue: {
    color: SummaryColors.ink,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  mediaRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  mediaMeta: {
    flex: 1,
    gap: 2,
  },
  mediaTitle: {
    color: SummaryColors.ink,
    fontSize: 15,
    fontWeight: "600",
  },
  mediaSubtitle: {
    color: SummaryColors.secondary,
    fontSize: 13,
    fontWeight: "400",
  },
  deferredCard: {
    marginTop: 14,
    backgroundColor: SummaryColors.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SummaryColors.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 8,
  },
  deferredHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  deferredTitle: {
    color: SummaryColors.ink,
    fontSize: 15,
    fontWeight: "600",
  },
  deferredCount: {
    color: SummaryColors.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  deferredItem: {
    color: SummaryColors.secondary,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  flexSpace: {
    flex: 1,
    minHeight: 24,
  },
});
