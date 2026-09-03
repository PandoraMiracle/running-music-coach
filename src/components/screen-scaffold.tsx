import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Palette } from "@/constants/theme";

type ScreenScaffoldProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  hideBack?: boolean;
  onBack?: () => void;
  footer?: React.ReactNode;
  badge?: string;
};

export function ScreenScaffold({
  title,
  subtitle,
  children,
  hideBack = false,
  onBack,
  footer,
  badge,
}: ScreenScaffoldProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.topRow}>
        {hideBack ? (
          <View />
        ) : (
          <Pressable
            accessibilityRole="button"
            hitSlop={12}
            onPress={onBack ?? (() => router.back())}
          >
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
        )}
        {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      </View>

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.bg,
    paddingHorizontal: 20,
  },
  topRow: {
    minHeight: 28,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  back: {
    color: Palette.accent,
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    color: Palette.warning,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    color: Palette.text,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: Palette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  content: {
    paddingTop: 20,
    paddingBottom: 24,
    gap: 12,
  },
  footer: {
    paddingTop: 8,
    paddingBottom: 8,
    gap: 10,
  },
});
