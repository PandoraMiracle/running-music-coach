import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
import type { AudioModePreset } from "@/types";

/** Same surface language as S02/S03 selectable rows. */
const ModeColors = {
  bg: "#F5F7F4",
  surfaceMuted: "#F0F2EF",
  surfaceSelected: "#E6F6F0",
  ink: "#0F1714",
  secondary: "#47544F",
  muted: "#73807A",
  accent: "#00A87A",
  iconWell: "#E2EBE6",
} as const;

/** Approved S04 copy — does not mutate frozen preset definitions. */
const PRESET_DISPLAY: Record<
  DefaultAudioModeType,
  { description: string; status: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  music_first: {
    description: "Protect music flow. Only safety and turns break in.",
    status: "Pace Sync off",
    icon: "musical-notes",
  },
  pace_sync: {
    description: "Music adapts gently when pace drifts from target.",
    status: "Adaptation: Normal",
    icon: "pulse",
  },
  balanced: {
    description: "More coaching in-run. Milestones use smart timing.",
    status: "Pace Sync off",
    icon: "options",
  },
};

function openCustomEditor(basePresetType: DefaultAudioModeType) {
  router.push({
    pathname: ROUTES.customAudioMode,
    params: { mode: "from_preset", base: basePresetType },
  });
}

function openExistingCustomEditor(customModeId: string) {
  router.push({
    pathname: ROUTES.customAudioMode,
    params: { mode: "existing_custom", customId: customModeId },
  });
}

type PresetRowProps = {
  mode: AudioModePreset;
  selected: boolean;
  onSelect: () => void;
  onOpenCustom: () => void;
};

function PresetRow({ mode, selected, onSelect, onOpenCustom }: PresetRowProps) {
  const display = PRESET_DISPLAY[mode.type];

  return (
    <View
      style={[styles.row, selected ? styles.rowSelected : styles.rowIdle]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${mode.name}. ${display.description}. ${display.status}`}
        onPress={onSelect}
        style={({ pressed }) => [
          styles.rowMain,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.iconWell}>
          <Ionicons
            name={display.icon}
            size={20}
            color={selected ? ModeColors.accent : ModeColors.secondary}
          />
        </View>
        <View style={styles.meta}>
          <Text style={[styles.name, selected && styles.nameSelected]}>
            {mode.name}
          </Text>
          <Text style={styles.description}>{display.description}</Text>
          <Text style={styles.status}>{display.status}</Text>
        </View>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Configure ${mode.name} as a custom mode base`}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
        onPress={onOpenCustom}
        style={({ pressed }) => [
          styles.chevronHit,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="chevron-forward"
          size={18}
          color={ModeColors.muted}
        />
      </Pressable>
    </View>
  );
}

type CustomRowProps = {
  mode: SessionCustomAudioMode;
  selected: boolean;
  onSelect: () => void;
  onOpenDetails: () => void;
};

function CustomModeRow({
  mode,
  selected,
  onSelect,
  onOpenDetails,
}: CustomRowProps) {
  return (
    <View
      style={[styles.row, selected ? styles.rowSelected : styles.rowIdle]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${mode.name}. Based on ${mode.basePresetName}`}
        onPress={onSelect}
        style={({ pressed }) => [
          styles.rowMain,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.iconWell}>
          <Ionicons
            name="person"
            size={20}
            color={selected ? ModeColors.accent : ModeColors.secondary}
          />
        </View>
        <View style={styles.meta}>
          <Text style={[styles.name, selected && styles.nameSelected]}>
            {mode.name}
          </Text>
          <Text style={styles.description}>Based on {mode.basePresetName}</Text>
          <Text style={styles.status}>
            {mode.paceSyncEnabled ? "Pace Sync on" : "Pace Sync off"}
          </Text>
        </View>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open details for ${mode.name}`}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
        onPress={onOpenDetails}
        style={({ pressed }) => [
          styles.chevronHit,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="chevron-forward"
          size={18}
          color={ModeColors.muted}
        />
      </Pressable>
    </View>
  );
}

export default function AudioModeScreen() {
  const { state, setAudioMode, setCustomBasePreset } = useSession();

  const openFromPreset = (basePresetType: DefaultAudioModeType) => {
    setCustomBasePreset(basePresetType);
    openCustomEditor(basePresetType);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.phone}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Audio Mode</Text>
          <Text style={styles.subtitle}>
            How interruptions meet your music while you run.
          </Text>

          <View style={styles.list}>
            {AUDIO_MODE_PRESETS.map((mode) => (
              <PresetRow
                key={mode.id}
                mode={mode}
                selected={mode.id === state.audioModeId}
                onSelect={() => setAudioMode(mode.id)}
                onOpenCustom={() => openFromPreset(mode.type)}
              />
            ))}
          </View>

          {state.customModes.length > 0 ? (
            <View style={styles.customSection}>
              <Text style={styles.sectionLabel}>My modes</Text>
              <View style={styles.list}>
                {state.customModes.map((mode) => (
                  <CustomModeRow
                    key={mode.id}
                    mode={mode}
                    selected={mode.id === state.audioModeId}
                    onSelect={() => setAudioMode(mode.id)}
                    onOpenDetails={() => openExistingCustomEditor(mode.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label="Continue"
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
    backgroundColor: ModeColors.bg,
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
    color: ModeColors.ink,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: ModeColors.secondary,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 20,
  },
  list: {
    gap: 8,
  },
  customSection: {
    marginTop: 28,
  },
  sectionLabel: {
    color: ModeColors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  row: {
    minHeight: 56,
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  rowSelected: {
    backgroundColor: ModeColors.surfaceSelected,
  },
  rowIdle: {
    backgroundColor: ModeColors.surfaceMuted,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 2,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: ModeColors.iconWell,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    flex: 1,
    gap: 1,
    justifyContent: "center",
  },
  name: {
    color: ModeColors.ink,
    fontSize: 14,
    fontWeight: "600",
  },
  nameSelected: {
    fontWeight: "700",
  },
  description: {
    color: ModeColors.secondary,
    fontSize: 12,
    fontWeight: "400",
  },
  status: {
    color: ModeColors.muted,
    fontSize: 12,
    fontWeight: "400",
    marginTop: 1,
  },
  check: {
    color: ModeColors.accent,
    fontSize: 15,
    fontWeight: "700",
    marginRight: 2,
  },
  chevronHit: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
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
