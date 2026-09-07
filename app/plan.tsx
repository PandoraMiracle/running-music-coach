import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { formatPace } from "@/constants/format";
import { ROUTES } from "@/constants/routes";
import { Spacing } from "@/constants/theme";
import {
  DISTANCE_MAX_KM,
  DISTANCE_MIN_KM,
  PACE_MAX_SEC,
  PACE_MIN_SEC,
  RUN_TYPES,
} from "@/data/runTypes";
import { useSession } from "@/store/session-store";

const PlanColors = {
  bg: "#F5F7F4",
  surfaceMuted: "#F0F2EF",
  surfaceSelected: "#E6F6F0",
  surface: "#FFFFFF",
  ink: "#0F1714",
  secondary: "#47544F",
  muted: "#73807A",
  accent: "#00A87A",
  danger: "#A12828",
  divider: "#E4E9E4",
  inputBorder: "#D7DED8",
  overlay: "rgba(15, 23, 20, 0.45)",
} as const;

const DISTANCE_PRESETS = [3, 5, 10, 21.1] as const;

const PACE_PRESETS = [
  { label: "5:00 /km", sec: 300 },
  { label: "5:30 /km", sec: 330 },
  { label: "6:00 /km", sec: 360 },
  { label: "6:30 /km", sec: 390 },
  { label: "7:00 /km", sec: 420 },
] as const;

function paceParts(secPerKm: number) {
  const formatted = formatPace(secPerKm);
  return {
    value: formatted.replace("/km", "").trim(),
    unit: "/km",
  };
}

function formatPaceMmSs(secPerKm: number) {
  return paceParts(secPerKm).value;
}

function parseDistanceInput(
  raw: string,
): { ok: true; value: number } | { ok: false; message: string } {
  const trimmed = raw.trim().replace(",", ".");
  if (!trimmed) {
    return { ok: false, message: "Enter a distance greater than 0." };
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, message: "Enter a valid distance greater than 0." };
  }
  if (value < DISTANCE_MIN_KM || value > DISTANCE_MAX_KM) {
    return {
      ok: false,
      message: `Enter a distance between ${DISTANCE_MIN_KM} and ${DISTANCE_MAX_KM} km.`,
    };
  }
  return { ok: true, value: Math.round(value * 10) / 10 };
}

function parsePaceMmSs(
  raw: string,
): { ok: true; value: number } | { ok: false; message: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: "Enter pace as mm:ss." };
  }
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(trimmed);
  if (!match) {
    return { ok: false, message: "Use mm:ss with seconds 00–59." };
  }
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const total = minutes * 60 + seconds;
  if (total <= 0) {
    return { ok: false, message: "Pace must be greater than 0." };
  }
  if (total < PACE_MIN_SEC || total > PACE_MAX_SEC) {
    return {
      ok: false,
      message: `Pace must be between ${formatPaceMmSs(PACE_MIN_SEC)} and ${formatPaceMmSs(PACE_MAX_SEC)} /km.`,
    };
  }
  return { ok: true, value: total };
}

type StepperProps = {
  label: string;
  display: string;
  onDecrement: () => void;
  onIncrement: () => void;
  onOpenPicker: () => void;
};

function SettingStepper({
  label,
  display,
  onDecrement,
  onIncrement,
  onOpenPicker,
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
          accessibilityLabel={`${label} ${display}. Opens picker.`}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          onPress={onOpenPicker}
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

type PickerKind = "distance" | "pace";

export default function PlanScreen() {
  const {
    state,
    setRunType,
    adjustDistance,
    adjustPace,
    setDistanceKm,
    setTargetPaceSecPerKm,
  } = useSession();
  const pace = paceParts(state.targetPaceSecPerKm);

  const [picker, setPicker] = useState<PickerKind | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const openDistancePicker = () => {
    setPicker("distance");
    setCustomMode(false);
    setDraft(String(state.distanceKm));
    setError(null);
  };

  const openPacePicker = () => {
    setPicker("pace");
    setCustomMode(false);
    setDraft(formatPaceMmSs(state.targetPaceSecPerKm));
    setError(null);
  };

  const closePicker = () => {
    setPicker(null);
    setCustomMode(false);
    setDraft("");
    setError(null);
  };

  const applyCustom = () => {
    if (picker === "distance") {
      const parsed = parseDistanceInput(draft);
      if (!parsed.ok) {
        setError(parsed.message);
        return;
      }
      setDistanceKm(parsed.value);
      closePicker();
      return;
    }
    if (picker === "pace") {
      const parsed = parsePaceMmSs(draft);
      if (!parsed.ok) {
        setError(parsed.message);
        return;
      }
      setTargetPaceSecPerKm(parsed.value);
      closePicker();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.phone}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                onOpenPicker={openDistancePicker}
              />
              <SettingStepper
                label="Target pace"
                display={`${pace.value} ${pace.unit}`}
                onDecrement={() => adjustPace(-1)}
                onIncrement={() => adjustPace(1)}
                onOpenPicker={openPacePicker}
              />
            </View>
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

      <Modal
        visible={picker !== null}
        transparent
        animationType="fade"
        onRequestClose={closePicker}
      >
        <Pressable style={styles.modalOverlay} onPress={closePicker}>
          <Pressable
            style={styles.modalCard}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.modalTitle}>
              {picker === "distance" ? "Distance" : "Target pace"}
            </Text>

            {picker === "distance"
              ? DISTANCE_PRESETS.map((km) => {
                  const selected =
                    !customMode && Math.abs(state.distanceKm - km) < 0.001;
                  return (
                    <Pressable
                      key={km}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        setDistanceKm(km);
                        closePicker();
                      }}
                      style={({ pressed }) => [
                        styles.optionRow,
                        selected && styles.optionRowSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLabel,
                          selected && styles.optionLabelSelected,
                        ]}
                      >
                        {Number.isInteger(km) ? `${km} km` : `${km} km`}
                      </Text>
                      {selected ? <Text style={styles.check}>✓</Text> : null}
                    </Pressable>
                  );
                })
              : null}

            {picker === "pace"
              ? PACE_PRESETS.map((item) => {
                  const selected =
                    !customMode && state.targetPaceSecPerKm === item.sec;
                  return (
                    <Pressable
                      key={item.sec}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        setTargetPaceSecPerKm(item.sec);
                        closePicker();
                      }}
                      style={({ pressed }) => [
                        styles.optionRow,
                        selected && styles.optionRowSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLabel,
                          selected && styles.optionLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {selected ? <Text style={styles.check}>✓</Text> : null}
                    </Pressable>
                  );
                })
              : null}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: customMode }}
              onPress={() => {
                setCustomMode(true);
                setError(null);
                if (picker === "distance") {
                  setDraft(String(state.distanceKm));
                } else {
                  setDraft(formatPaceMmSs(state.targetPaceSecPerKm));
                }
              }}
              style={({ pressed }) => [
                styles.optionRow,
                customMode && styles.optionRowSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.optionLabel,
                  customMode && styles.optionLabelSelected,
                ]}
              >
                Custom
              </Text>
              {customMode ? <Text style={styles.check}>✓</Text> : null}
            </Pressable>

            {customMode ? (
              <View style={styles.customBlock}>
                <TextInput
                  accessibilityLabel={
                    picker === "distance"
                      ? "Custom distance in kilometers"
                      : "Custom target pace as minutes colon seconds"
                  }
                  value={draft}
                  onChangeText={(text) => {
                    setDraft(text);
                    setError(null);
                  }}
                  onSubmitEditing={applyCustom}
                  keyboardType={
                    picker === "distance"
                      ? "decimal-pad"
                      : "numbers-and-punctuation"
                  }
                  placeholder={picker === "distance" ? "e.g. 7.5" : "e.g. 5:45"}
                  placeholderTextColor={PlanColors.muted}
                  style={styles.modalInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {error ? (
                  <Text style={styles.modalError}>{error}</Text>
                ) : (
                  <Text style={styles.modalHint}>
                    {picker === "distance"
                      ? "Kilometers"
                      : "Format mm:ss per km"}
                  </Text>
                )}
                <View style={styles.modalActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={closePicker}
                    style={({ pressed }) => [
                      styles.modalSecondary,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.modalSecondaryLabel}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={applyCustom}
                    style={({ pressed }) => [
                      styles.modalPrimary,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.modalPrimaryLabel}>Apply</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.modalActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={closePicker}
                  style={({ pressed }) => [
                    styles.modalSecondary,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.modalSecondaryLabel}>Close</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: PlanColors.overlay,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: PlanColors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 4,
  },
  modalTitle: {
    color: PlanColors.ink,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  optionRow: {
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionRowSelected: {
    backgroundColor: PlanColors.surfaceSelected,
  },
  optionLabel: {
    color: PlanColors.ink,
    fontSize: 15,
    fontWeight: "600",
  },
  optionLabelSelected: {
    color: PlanColors.accent,
    fontWeight: "700",
  },
  customBlock: {
    marginTop: 8,
    gap: 6,
    paddingHorizontal: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: PlanColors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: PlanColors.ink,
    backgroundColor: PlanColors.bg,
    fontWeight: "600",
  },
  modalHint: {
    color: PlanColors.muted,
    fontSize: 12,
    fontWeight: "500",
  },
  modalError: {
    color: PlanColors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  modalSecondary: {
    minHeight: 40,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSecondaryLabel: {
    color: PlanColors.secondary,
    fontSize: 15,
    fontWeight: "600",
  },
  modalPrimary: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: PlanColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
