import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export type RunOverlayKind = "safety" | "pocket_guard";

const OverlayTokens = {
  safetyTint: "rgba(198, 56, 56, 1)",
  safetyChipBg: "#FCEAEA",
  safetyChipBorder: "#E8B4B4",
  safetyInk: "#A12828",
  pocketTint: "rgba(214, 122, 36, 1)",
  pocketChipBg: "#FFF3E6",
  pocketChipBorder: "#E8C49A",
  pocketInk: "#B35A12",
} as const;

type RunStatusOverlayProps = {
  kind: RunOverlayKind;
};

/**
 * Lightweight alert layer for S07 — sits above the shared Running skeleton
 * without replacing pace / stats / Now Playing.
 */
export function RunStatusOverlay({ kind }: RunStatusOverlayProps) {
  const pulse = useSharedValue(0.1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(0.2, {
        duration: 1100,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [pulse]);

  const tintStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  const isSafety = kind === "safety";
  const tintColor = isSafety
    ? OverlayTokens.safetyTint
    : OverlayTokens.pocketTint;
  const chipBg = isSafety
    ? OverlayTokens.safetyChipBg
    : OverlayTokens.pocketChipBg;
  const chipBorder = isSafety
    ? OverlayTokens.safetyChipBorder
    : OverlayTokens.pocketChipBorder;
  const chipInk = isSafety ? OverlayTokens.safetyInk : OverlayTokens.pocketInk;
  const label = isSafety ? "Safety alert" : "Pocket Guard";
  const iconName = isSafety ? "warning" : "lock-closed";

  return (
    <View pointerEvents="none" style={styles.layer}>
      <Animated.View
        style={[styles.tint, { backgroundColor: tintColor }, tintStyle]}
      />
      <View style={styles.chipRow}>
        <View
          style={[
            styles.chip,
            {
              backgroundColor: chipBg,
              borderColor: chipBorder,
            },
          ]}
        >
          <Ionicons name={iconName} size={16} color={chipInk} />
          <Text style={[styles.chipLabel, { color: chipInk }]}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
  },
  tint: {
    ...StyleSheet.absoluteFill,
  },
  chipRow: {
    position: "absolute",
    top: 52,
    left: 24,
    right: 24,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
});
