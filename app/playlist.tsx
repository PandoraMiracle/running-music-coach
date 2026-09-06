import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { ROUTES } from "@/constants/routes";
import { Spacing } from "@/constants/theme";
import { PLAYLISTS } from "@/data/playlists";
import { useSession } from "@/store/session-store";

/** Local mock artwork colors — no remote images. Matches Home placeholder approach. */
const ARTWORK_COLORS: Record<string, string> = {
  "morning-momentum": "#1A7360",
  "easy-groove": "#3D6B8C",
  "race-focus": "#B45A3C",
  "night-run": "#3A4560",
  "recovery-mix": "#6B7A4A",
};

/** Same surface language as S02 Run Type rows. */
const PlaylistColors = {
  bg: "#F5F7F4",
  surfaceMuted: "#F0F2EF",
  surfaceSelected: "#E6F6F0",
  ink: "#0F1714",
  secondary: "#47544F",
  muted: "#73807A",
  accent: "#00A87A",
} as const;

export default function PlaylistScreen() {
  const { state, setPlaylist } = useSession();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.phone}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Playlist</Text>
          <Text style={styles.subtitle}>
            Pick a mix that matches your target rhythm.
          </Text>

          <View style={styles.list}>
            {PLAYLISTS.map((playlist) => {
              const selected = playlist.id === state.playlistId;
              const artworkColor =
                ARTWORK_COLORS[playlist.id] ?? PlaylistColors.accent;

              return (
                <Pressable
                  key={playlist.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${playlist.title}. ${playlist.tracks.length} tracks, about ${playlist.approxBpm} BPM`}
                  onPress={() => setPlaylist(playlist.id)}
                  style={({ pressed }) => [
                    styles.row,
                    selected ? styles.rowSelected : styles.rowIdle,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[styles.artwork, { backgroundColor: artworkColor }]}
                  />
                  <View style={styles.meta}>
                    <Text
                      style={[styles.name, selected && styles.nameSelected]}
                    >
                      {playlist.title}
                    </Text>
                    <Text style={styles.metaLine}>
                      {`${playlist.tracks.length} tracks · ~${playlist.approxBpm} BPM`}
                    </Text>
                  </View>
                  {selected ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="Continue"
            onPress={() => router.push(ROUTES.home)}
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
    backgroundColor: PlaylistColors.bg,
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
    color: PlaylistColors.ink,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: PlaylistColors.secondary,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 20,
  },
  /** Same inter-row gap as S02 `typeList`. */
  list: {
    gap: 8,
  },
  /**
   * Same padding / radius / gap rhythm as S02 `typeRow`.
   * Height is content-driven so 48px artwork fits (S02 text-only rows are 56).
   */
  row: {
    minHeight: 56,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowSelected: {
    backgroundColor: PlaylistColors.surfaceSelected,
  },
  rowIdle: {
    backgroundColor: PlaylistColors.surfaceMuted,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  meta: {
    flex: 1,
    gap: 1,
    justifyContent: "center",
  },
  name: {
    color: PlaylistColors.ink,
    fontSize: 14,
    fontWeight: "600",
  },
  nameSelected: {
    fontWeight: "700",
  },
  metaLine: {
    color: PlaylistColors.secondary,
    fontSize: 12,
    fontWeight: "400",
  },
  check: {
    color: PlaylistColors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
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
