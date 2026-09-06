import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { formatPace } from "@/constants/format";
import { ROUTES } from "@/constants/routes";
import {
  DEFAULT_AUDIO_MODE,
  DEFAULT_PLAN,
  DEFAULT_PLAYLIST,
} from "@/store/defaults";

/** Approved light pre-run surface (warm off-white). */
const HomeColors = {
  bg: "#F5F7F4",
  surface: "#FFFFFF",
  ink: "#0F1714",
  secondary: "#47544F",
  muted: "#73807A",
  accent: "#00A87A",
  divider: "#E4E9E4",
} as const;

function paceValue(secPerKm: number): string {
  return formatPace(secPerKm).replace("/km", "").trim();
}

type SurfaceRowProps = {
  onPress: () => void;
  children: ReactNode;
  compact?: boolean;
};

function SurfaceRow({ onPress, children, compact }: SurfaceRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.surface,
        compact && styles.surfaceCompact,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.surfaceBody}>{children}</View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const audioMeta = DEFAULT_AUDIO_MODE.paceSyncEnabled
    ? "Music adapts to pace · Pace Sync on"
    : "Prioritize music · Pace Sync off";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.phone}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>Running Music Coach</Text>
          <Text style={styles.title}>Ready when you are</Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Upcoming run</Text>
            <SurfaceRow onPress={() => router.push(ROUTES.plan)}>
              <Text style={styles.cardEyebrow}>Target Pace</Text>
              <View style={styles.paceRow}>
                <Text style={styles.paceValue}>
                  {paceValue(DEFAULT_PLAN.targetPaceSecPerKm)}
                </Text>
                <Text style={styles.paceUnit}> /km</Text>
              </View>
              <Text style={styles.planLine}>
                {DEFAULT_PLAN.name} · {DEFAULT_PLAN.distanceKm.toFixed(1)} km
              </Text>
            </SurfaceRow>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Playlist</Text>
            <SurfaceRow
              compact
              onPress={() => router.push(ROUTES.playlist)}
            >
              <View style={styles.playlistRow}>
                <View style={styles.artwork} />
                <View style={styles.playlistMeta}>
                  <Text style={styles.rowTitle}>{DEFAULT_PLAYLIST.title}</Text>
                  <Text style={styles.rowMeta}>
                    {`${DEFAULT_PLAYLIST.tracks.length} tracks · ~${DEFAULT_PLAYLIST.approxBpm} BPM`}
                  </Text>
                </View>
              </View>
            </SurfaceRow>
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Audio Mode</Text>
            <SurfaceRow
              compact
              onPress={() => router.push(ROUTES.audioMode)}
            >
              <Text style={styles.rowTitle}>{DEFAULT_AUDIO_MODE.name}</Text>
              <Text style={styles.rowMeta}>{audioMeta}</Text>
            </SurfaceRow>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="Prepare Run"
            onPress={() => router.push(ROUTES.ready)}
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
    backgroundColor: HomeColors.bg,
    alignItems: "center",
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 16,
  },
  eyebrow: {
    color: HomeColors.accent,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  title: {
    color: HomeColors.ink,
    fontSize: 25,
    fontWeight: "700",
    marginBottom: 30,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    color: HomeColors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: HomeColors.divider,
    marginVertical: 22,
  },
  surface: {
    backgroundColor: HomeColors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  surfaceCompact: {
    paddingVertical: 14,
  },
  surfaceBody: {
    flex: 1,
  },
  pressed: {
    opacity: 0.82,
  },
  chevron: {
    color: HomeColors.muted,
    fontSize: 26,
    fontWeight: "300",
    lineHeight: 28,
  },
  cardEyebrow: {
    color: HomeColors.muted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  paceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  paceValue: {
    color: HomeColors.ink,
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 40,
  },
  paceUnit: {
    color: HomeColors.secondary,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 5,
  },
  planLine: {
    color: HomeColors.secondary,
    fontSize: 15,
    fontWeight: "500",
    marginTop: 8,
  },
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  artwork: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#1A7360",
  },
  playlistMeta: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    color: HomeColors.ink,
    fontSize: 16,
    fontWeight: "600",
  },
  rowMeta: {
    color: HomeColors.secondary,
    fontSize: 13,
    fontWeight: "400",
    marginTop: 3,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 22,
  },
  cta: {
    width: "100%",
    alignSelf: "stretch",
    minHeight: 56,
    borderRadius: 16,
  },
});
