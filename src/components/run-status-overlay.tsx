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

export type RunOverlayKind =
  | "safety"
  | "navigation"
  | "coaching"
  | "hydration"
  | "pocket_guard";

const OverlayTokens = {
  safetyTint: "rgba(198, 56, 56, 1)",
  safetyChipBg: "#FCEAEA",
  safetyChipBorder: "#E8B4B4",
  safetyInk: "#A12828",
  navigationTint: "rgba(37, 99, 180, 1)",
  navigationChipBg: "#EAF2FC",
  navigationChipBorder: "#B4C9E8",
  navigationInk: "#1B4F96",
  coachingTint: "rgba(70, 120, 100, 1)",
  coachingChipBg: "#EEF6F2",
  coachingChipBorder: "#C5D9CF",
  coachingInk: "#2F5E4C",
  hydrationTint: "rgba(70, 120, 150, 1)",
  hydrationChipBg: "#EEF4F8",
  hydrationChipBorder: "#C5D3DE",
  hydrationInk: "#2F5570",
  pocketTint: "rgba(214, 122, 36, 1)",
  pocketChipBg: "#FFF3E6",
  pocketChipBorder: "#E8C49A",
  pocketInk: "#B35A12",
} as const;

type OverlayVisual = {
  tintColor: string;
  chipBg: string;
  chipBorder: string;
  chipInk: string;
  label: string;
  detail: string;
  iconName: keyof typeof Ionicons.glyphMap;
  /** Softer pulse for non-critical Smart Timing delivery. */
  pulsePeak: number;
};

function visualForKind(kind: RunOverlayKind): OverlayVisual {
  if (kind === "safety") {
    return {
      tintColor: OverlayTokens.safetyTint,
      chipBg: OverlayTokens.safetyChipBg,
      chipBorder: OverlayTokens.safetyChipBorder,
      chipInk: OverlayTokens.safetyInk,
      label: "Safety alert",
      detail: "Important — delivered now",
      iconName: "warning",
      pulsePeak: 0.2,
    };
  }
  if (kind === "navigation") {
    return {
      tintColor: OverlayTokens.navigationTint,
      chipBg: OverlayTokens.navigationChipBg,
      chipBorder: OverlayTokens.navigationChipBorder,
      chipInk: OverlayTokens.navigationInk,
      label: "Navigation",
      detail: "Turn ahead — delivered now",
      iconName: "navigate",
      pulsePeak: 0.2,
    };
  }
  if (kind === "coaching") {
    return {
      tintColor: OverlayTokens.coachingTint,
      chipBg: OverlayTokens.coachingChipBg,
      chipBorder: OverlayTokens.coachingChipBorder,
      chipInk: OverlayTokens.coachingInk,
      label: "Coaching",
      detail: "Ease into the next kilometer",
      iconName: "fitness",
      pulsePeak: 0.12,
    };
  }
  if (kind === "hydration") {
    return {
      tintColor: OverlayTokens.hydrationTint,
      chipBg: OverlayTokens.hydrationChipBg,
      chipBorder: OverlayTokens.hydrationChipBorder,
      chipInk: OverlayTokens.hydrationInk,
      label: "Hydration",
      detail: "Take a sip when ready",
      iconName: "water",
      pulsePeak: 0.12,
    };
  }
  return {
    tintColor: OverlayTokens.pocketTint,
    chipBg: OverlayTokens.pocketChipBg,
    chipBorder: OverlayTokens.pocketChipBorder,
    chipInk: OverlayTokens.pocketInk,
    label: "Pocket Guard",
    detail: "Screen gestures locked",
    iconName: "lock-closed",
    pulsePeak: 0.2,
  };
}

type RunStatusOverlayProps = {
  kind: RunOverlayKind;
};

/**
 * Lightweight alert layer for S07 — sits above the shared Running skeleton
 * without replacing pace / stats / Now Playing.
 * Immediate overlays must NOT imply RUN PAUSED.
 * Smart Timing copy must NOT reveal policy terms.
 */
export function RunStatusOverlay({ kind }: RunStatusOverlayProps) {
  const pulse = useSharedValue(0.06);
  const visual = visualForKind(kind);

  useEffect(() => {
    pulse.value = 0.06;
    pulse.value = withRepeat(
      withTiming(visual.pulsePeak, {
        duration: 1100,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [pulse, kind, visual.pulsePeak]);

  const tintStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <View pointerEvents="none" style={styles.layer}>
      <Animated.View
        style={[
          styles.tint,
          { backgroundColor: visual.tintColor },
          tintStyle,
        ]}
      />
      <View style={styles.chipRow}>
        <View
          style={[
            styles.chip,
            {
              backgroundColor: visual.chipBg,
              borderColor: visual.chipBorder,
            },
          ]}
        >
          <Ionicons name={visual.iconName} size={16} color={visual.chipInk} />
          <View style={styles.chipText}>
            <Text style={[styles.chipLabel, { color: visual.chipInk }]}>
              {visual.label}
            </Text>
            <Text style={[styles.chipDetail, { color: visual.chipInk }]}>
              {visual.detail}
            </Text>
          </View>
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
    maxWidth: "100%",
  },
  chipText: {
    flexShrink: 1,
    gap: 1,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  chipDetail: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.9,
  },
});
