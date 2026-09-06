import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { ROUTES } from "@/constants/routes";
import { Spacing } from "@/constants/theme";
import { AUDIO_MODE_PRESETS } from "@/data/audioModes";
import {
  useSession,
  type DefaultAudioModeType,
  type SessionCustomAudioMode,
} from "@/store/session-store";
import type {
  AudioModePolicies,
  DeliveryPolicy,
  EventKind,
  PaceSyncStrength,
} from "@/types";

const EditorColors = {
  bg: "#F5F7F4",
  surface: "#FFFFFF",
  surfaceMuted: "#F0F2EF",
  ink: "#0F1714",
  secondary: "#47544F",
  muted: "#73807A",
  accent: "#00A87A",
  divider: "#E4E9E4",
  overlay: "rgba(15, 23, 20, 0.4)",
  danger: "#B42318",
} as const;

const EVENT_ROWS: { key: EventKind; label: string }[] = [
  { key: "safety", label: "Safety alerts" },
  { key: "navigation", label: "Navigation" },
  { key: "workout", label: "Workout guidance" },
  { key: "hydration", label: "Hydration" },
  { key: "milestone", label: "Milestones" },
  { key: "routine", label: "Routine stats" },
];

const POLICY_OPTIONS: { value: DeliveryPolicy; label: string }[] = [
  { value: "immediate", label: "Immediate" },
  { value: "smart", label: "Smart" },
  { value: "deferred", label: "Deferred" },
];

const ADAPTATION_OPTIONS: { value: PaceSyncStrength; label: string }[] = [
  { value: "gentle", label: "Gentle" },
  { value: "normal", label: "Normal" },
  { value: "strong", label: "Strong" },
];

const VALID_BASE_TYPES: DefaultAudioModeType[] = [
  "music_first",
  "pace_sync",
  "balanced",
];

type EditorMode = "from_preset" | "existing_custom";

function isBaseType(value: string | undefined): value is DefaultAudioModeType {
  return !!value && (VALID_BASE_TYPES as string[]).includes(value);
}

function clonePolicies(policies: AudioModePolicies): AudioModePolicies {
  return {
    safety: policies.safety,
    navigation: policies.navigation,
    workout: policies.workout,
    hydration: policies.hydration,
    milestone: policies.milestone,
    routine: policies.routine,
  };
}

function resolveBasePreset(baseType: DefaultAudioModeType) {
  return (
    AUDIO_MODE_PRESETS.find((preset) => preset.type === baseType) ??
    AUDIO_MODE_PRESETS[0]
  );
}

type SegmentedProps<T extends string> = {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
};

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: SegmentedProps<T>) {
  return (
    <View style={[styles.segmentTrack, disabled && styles.segmentDisabled]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: !!disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={[
              styles.segmentItem,
              selected && styles.segmentItemSelected,
            ]}
          >
            <Text
              style={[
                styles.segmentLabel,
                selected && styles.segmentLabelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type DraftSource = {
  policies: AudioModePolicies;
  paceSyncEnabled: boolean;
  adaptation: PaceSyncStrength;
};

export default function CustomAudioModeScreen() {
  const params = useLocalSearchParams<{
    mode?: string;
    base?: string;
    customId?: string;
  }>();
  const { state, saveCustomMode, updateCustomMode } = useSession();

  const editorMode: EditorMode = useMemo(() => {
    if (params.mode === "existing_custom" || params.customId) {
      return "existing_custom";
    }
    return "from_preset";
  }, [params.mode, params.customId]);

  const existingCustom = useMemo(() => {
    if (editorMode !== "existing_custom") return null;
    const id = typeof params.customId === "string" ? params.customId : "";
    return state.customModes.find((item) => item.id === id) ?? null;
  }, [editorMode, params.customId, state.customModes]);

  const baseType: DefaultAudioModeType = useMemo(() => {
    if (existingCustom) return existingCustom.basePresetType;
    if (isBaseType(params.base)) return params.base;
    if (state.customBasePresetType) return state.customBasePresetType;
    return "music_first";
  }, [
    existingCustom,
    params.base,
    state.customBasePresetType,
  ]);

  const basePreset = useMemo(() => resolveBasePreset(baseType), [baseType]);

  const draftSource: DraftSource = useMemo(() => {
    if (existingCustom) {
      return {
        policies: clonePolicies(existingCustom.policies),
        paceSyncEnabled: existingCustom.paceSyncEnabled,
        adaptation: existingCustom.adaptation,
      };
    }
    return {
      policies: clonePolicies(basePreset.policies),
      paceSyncEnabled: basePreset.paceSyncEnabled,
      adaptation: basePreset.adaptation ?? "normal",
    };
  }, [existingCustom, basePreset]);

  const editorKey =
    editorMode === "existing_custom"
      ? `custom:${existingCustom?.id ?? "missing"}`
      : `preset:${baseType}`;

  const [policies, setPolicies] = useState<AudioModePolicies>(
    draftSource.policies,
  );
  const [paceSyncEnabled, setPaceSyncEnabled] = useState(
    draftSource.paceSyncEnabled,
  );
  const [adaptation, setAdaptation] = useState<PaceSyncStrength>(
    draftSource.adaptation,
  );

  const [namingOpen, setNamingOpen] = useState(false);
  const [modeName, setModeName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    setPolicies(clonePolicies(draftSource.policies));
    setPaceSyncEnabled(draftSource.paceSyncEnabled);
    setAdaptation(draftSource.adaptation);
    setNamingOpen(false);
    setModeName("");
    setNameError(null);
    // Reset only when switching preset/custom editor context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorKey]);

  const setPolicy = (key: EventKind, value: DeliveryPolicy) => {
    setPolicies((current) => ({ ...current, [key]: value }));
  };

  const goBackWithoutSaving = () => {
    router.replace(ROUTES.audioMode);
  };

  const openNaming = () => {
    setModeName("");
    setNameError(null);
    setNamingOpen(true);
  };

  const cancelNaming = () => {
    setNamingOpen(false);
    setModeName("");
    setNameError(null);
  };

  const buildDraftPayload = (
    name: string,
    source: SessionCustomAudioMode | null,
  ): SessionCustomAudioMode => ({
    id: source?.id ?? `custom-${Date.now()}`,
    name,
    basePresetType: source?.basePresetType ?? basePreset.type,
    basePresetName: source?.basePresetName ?? basePreset.name,
    policies: clonePolicies(policies),
    paceSyncEnabled,
    adaptation: paceSyncEnabled ? adaptation : source?.adaptation ?? "normal",
  });

  const confirmCreate = () => {
    const trimmed = modeName.trim();
    if (!trimmed) {
      setNameError("Enter a mode name.");
      return;
    }

    saveCustomMode(buildDraftPayload(trimmed, null));
    setNamingOpen(false);
    router.replace(ROUTES.audioMode);
  };

  const saveExistingChanges = () => {
    if (!existingCustom) {
      goBackWithoutSaving();
      return;
    }

    updateCustomMode(buildDraftPayload(existingCustom.name, existingCustom));
    router.replace(ROUTES.audioMode);
  };

  const title =
    editorMode === "existing_custom"
      ? "Edit Audio Mode"
      : "Customize Audio Mode";

  const subtitle =
    editorMode === "existing_custom"
      ? existingCustom?.name ?? "Custom mode"
      : `Based on ${basePreset.name}`;

  const metaLine =
    editorMode === "existing_custom" && existingCustom
      ? `Based on ${existingCustom.basePresetName}`
      : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.phone}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Audio Mode"
            hitSlop={12}
            onPress={goBackWithoutSaving}
            style={({ pressed }) => [
              styles.backHit,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            {metaLine ? <Text style={styles.metaLine}>{metaLine}</Text> : null}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>Event delivery</Text>
          <View style={styles.group}>
            {EVENT_ROWS.map((row, index) => (
              <View key={row.key}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.settingBlock}>
                  <Text style={styles.settingLabel}>{row.label}</Text>
                  <SegmentedControl
                    value={policies[row.key]}
                    options={POLICY_OPTIONS}
                    onChange={(value) => setPolicy(row.key, value)}
                  />
                </View>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionLabel, styles.sectionSpaced]}>
            Pace Sync
          </Text>
          <View style={styles.group}>
            <View style={styles.toggleRow}>
              <Text style={styles.settingLabel}>Pace Sync</Text>
              <Switch
                accessibilityLabel="Pace Sync"
                value={paceSyncEnabled}
                onValueChange={setPaceSyncEnabled}
                trackColor={{
                  false: "#D5DBD7",
                  true: "#9BD9C5",
                }}
                thumbColor={paceSyncEnabled ? EditorColors.accent : "#F4F5F4"}
              />
            </View>

            {paceSyncEnabled ? (
              <>
                <View style={styles.divider} />
                <View style={styles.settingBlock}>
                  <Text style={styles.settingLabel}>Adaptation strength</Text>
                  <SegmentedControl
                    value={adaptation}
                    options={ADAPTATION_OPTIONS}
                    onChange={setAdaptation}
                  />
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={
              editorMode === "existing_custom"
                ? "Save changes"
                : "Save as new mode"
            }
            onPress={
              editorMode === "existing_custom"
                ? saveExistingChanges
                : openNaming
            }
            style={styles.cta}
          />
        </View>
      </View>

      <Modal
        visible={namingOpen}
        transparent
        animationType="fade"
        onRequestClose={cancelNaming}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Name your mode</Text>
            <TextInput
              accessibilityLabel="Mode name"
              autoFocus
              value={modeName}
              onChangeText={(text) => {
                setModeName(text);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. Race Focus"
              placeholderTextColor={EditorColors.muted}
              style={styles.modalInput}
              returnKeyType="done"
              onSubmitEditing={confirmCreate}
            />
            {nameError ? (
              <Text style={styles.modalError}>{nameError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={cancelNaming}
                style={({ pressed }) => [
                  styles.modalSecondary,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.modalSecondaryLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={confirmCreate}
                style={({ pressed }) => [
                  styles.modalPrimary,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.modalPrimaryLabel}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: EditorColors.bg,
    alignItems: "center",
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: Spacing.three,
    paddingBottom: 8,
    gap: 4,
  },
  backHit: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  backGlyph: {
    color: EditorColors.ink,
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 30,
  },
  headerText: {
    flex: 1,
    paddingRight: 8,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: Spacing.four,
  },
  title: {
    color: EditorColors.ink,
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: EditorColors.secondary,
    fontSize: 15,
    marginTop: 4,
  },
  metaLine: {
    color: EditorColors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  sectionLabel: {
    color: EditorColors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  sectionSpaced: {
    marginTop: 24,
  },
  group: {
    backgroundColor: EditorColors.surface,
    borderRadius: 14,
    overflow: "hidden",
  },
  settingBlock: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  settingLabel: {
    color: EditorColors.ink,
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: EditorColors.divider,
    marginLeft: 14,
  },
  toggleRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  segmentTrack: {
    flexDirection: "row",
    backgroundColor: EditorColors.surfaceMuted,
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  segmentDisabled: {
    opacity: 0.45,
  },
  segmentItem: {
    flex: 1,
    minHeight: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  segmentItemSelected: {
    backgroundColor: EditorColors.surface,
  },
  segmentLabel: {
    color: EditorColors.secondary,
    fontSize: 12,
    fontWeight: "600",
  },
  segmentLabelSelected: {
    color: EditorColors.ink,
    fontWeight: "700",
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
    backgroundColor: EditorColors.overlay,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: EditorColors.surface,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },
  modalTitle: {
    color: EditorColors.ink,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: EditorColors.divider,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: EditorColors.ink,
    backgroundColor: EditorColors.bg,
  },
  modalError: {
    color: EditorColors.danger,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  modalSecondary: {
    minHeight: 40,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSecondaryLabel: {
    color: EditorColors.secondary,
    fontSize: 15,
    fontWeight: "600",
  },
  modalPrimary: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: EditorColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
  },
});
