import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Palette } from "@/constants/theme";

type InfoCardProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  selected?: boolean;
  badge?: string;
  children?: ReactNode;
  onPress?: () => void;
};

export function InfoCard({
  title,
  subtitle,
  meta,
  selected = false,
  badge,
  children,
  onPress,
}: InfoCardProps) {
  const content = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {badge || selected ? (
          <Text style={[styles.badge, selected && styles.selectedBadge]}>
            {badge ?? "Selected"}
          </Text>
        ) : null}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      {children}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          selected && styles.selected,
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.card, selected && styles.selected]}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.card,
    borderColor: Palette.cardBorder,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  selected: {
    borderColor: Palette.accent,
    backgroundColor: Palette.accentDim,
  },
  pressed: {
    opacity: 0.88,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: {
    color: Palette.text,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  subtitle: {
    color: Palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    color: Palette.accent,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  badge: {
    color: Palette.blue,
    fontSize: 12,
    fontWeight: "700",
  },
  selectedBadge: {
    color: Palette.accent,
  },
});
