import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { formatPace } from "@/constants/format";
import { ROUTES } from "@/constants/routes";
import { Spacing } from "@/constants/theme";
import { RUN_TYPES } from "@/data/runTypes";
import { useSession } from "@/store/session-store";

const PlanColors = {
  bg: "#F5F7F4",
  surfaceMuted: "#F0F2EF",
  surfaceSelected: "#E6F6F0",
  ink: "#0F1714",
  secondary: "#47544F",
  muted: "#73807A",
  accent: "#00A87A",
} as const;

function paceParts(secPerKm: number) {
  const formatted = formatPace(secPerKm);
  return {
    value: formatted.replace("/km", "").trim(),
    unit: "/km",
  };
}

type StepperProps = {
  label: string;
  display: string;
  onDecrement: () => void;
  onIncrement: () => void;
};

function SettingStepper({
  label,
  display,
  onDecrement,
  onIncrement,
}: StepperProps) {
  return (
    <View style={styles.settingColumn}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 8 }}
          onPress={onDecrement}
          style={({ pressed }) => [styles.stepHit, pressed && styles.pressed]}
        >
          <Text style={styles.stepGlyph}>−</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} ${display}. Opens picker later.`}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          style={({ pressed }) => [
            styles.stepValueHit,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.stepValue}>{display}</Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={PlanColors.muted}
            style={styles.stepChevron}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}
          onPress={onIncrement}
          style={({ pressed }) => [styles.stepHit, pressed && styles.pressed]}
        >
          <Text style={styles.stepGlyph}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function PlanScreen() {
  const { state, setRunType, adjustDistance, adjustPace } = useSession();
  const pace = paceParts(state.targetPaceSecPerKm);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.phone}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Running Plan</Text>
          <Text style={styles.subtitle}>Choose your run</Text>

          <Text style={styles.sectionLabel}>Run type</Text>
          <View style={styles.typeList}>
            {RUN_TYPES.map((option) => {
              const selected = option.id === state.runTypeId;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setRunType(option.id)}
                  style={({ pressed }) => [
                    styles.typeRow,
                    selected ? styles.typeRowSelected : styles.typeRowIdle,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.typeTextCol}>
                    <Text
                      style={[
                        styles.typeName,
                        selected && styles.typeNameSelected,
                      ]}
                    >
                      {option.name}
                    </Text>
                    <Text style={styles.typeDesc}>{option.description}</Text>
                  </View>
                  {selected ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.settingsBlock}>
            <Text style={styles.sectionLabel}>Run settings</Text>
            <View style={styles.settingsRow}>
              <SettingStepper
                label="Distance"
                display={`${state.distanceKm.toFixed(2)} km`}
                onDecrement={() => adjustDistance(-1)}
                onIncrement={() => adjustDistance(1)}
              />
              <SettingStepper
                label="Target pace"
                display={`${pace.value} ${pace.unit}`}
                onDecrement={() => adjustPace(-1)}
                onIncrement={() => adjustPace(1)}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="Continue"
            onPress={() => router.push("/")}
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
    backgroundColor: PlanColors.bg,
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
    color: PlanColors.ink,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: PlanColors.secondary,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 20,
  },
  sectionLabel: {
    color: PlanColors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  typeList: {
    gap: 8,
  },
  typeRow: {
    height: 56,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  typeRowSelected: {
    backgroundColor: PlanColors.surfaceSelected,
  },
  typeRowIdle: {
    backgroundColor: PlanColors.surfaceMuted,
  },
  typeTextCol: {
    flex: 1,
    gap: 1,
    justifyContent: "center",
  },
  typeName: {
    color: PlanColors.ink,
    fontSize: 14,
    fontWeight: "600",
  },
  typeNameSelected: {
    fontWeight: "700",
  },
  typeDesc: {
    color: PlanColors.secondary,
    fontSize: 12,
    fontWeight: "400",
  },
  check: {
    color: PlanColors.accent,
    fontSize: 15,
    fontWeight: "700",
  },
  settingsBlock: {
    marginTop: 28,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 24,
  },
  settingColumn: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: 160,
    alignItems: "flex-start",
    gap: 6,
  },
  settingLabel: {
    color: PlanColors.ink,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "left",
    alignSelf: "flex-start",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    alignSelf: "flex-start",
    gap: 10,
  },
  stepHit: {
    width: 20,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  stepGlyph: {
    color: PlanColors.ink,
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 20,
  },
  stepValueHit: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 5,
    flexGrow: 0,
    flexShrink: 0,
  },
  stepValue: {
    color: PlanColors.ink,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "left",
  },
  stepChevron: {
    marginTop: 1,
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
