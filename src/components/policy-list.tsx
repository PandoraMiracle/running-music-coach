import { StyleSheet, Text, View } from "react-native";

import { formatPolicy } from "@/constants/format";
import { Palette } from "@/constants/theme";
import type { AudioModePolicies, DeliveryPolicy, EventKind } from "@/types";

const EVENT_LABELS: Record<EventKind, string> = {
  safety: "Safety alerts",
  navigation: "Navigation / turn",
  workout: "Workout guidance",
  hydration: "Hydration",
  milestone: "Milestones",
  routine: "Routine stats",
};

const POLICY_ORDER: EventKind[] = [
  "safety",
  "navigation",
  "workout",
  "hydration",
  "milestone",
  "routine",
];

function policyColor(policy: DeliveryPolicy): string {
  if (policy === "immediate") return Palette.danger;
  if (policy === "smart") return Palette.warning;
  return Palette.blue;
}

type PolicyListProps = {
  policies: AudioModePolicies;
};

export function PolicyList({ policies }: PolicyListProps) {
  return (
    <View style={styles.list}>
      {POLICY_ORDER.map((kind) => (
        <View key={kind} style={styles.row}>
          <Text style={styles.label}>{EVENT_LABELS[kind]}</Text>
          <Text style={[styles.policy, { color: policyColor(policies[kind]) }]}>
            {formatPolicy(policies[kind])}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: 8,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    color: Palette.muted,
    fontSize: 13,
    flex: 1,
  },
  policy: {
    fontSize: 13,
    fontWeight: "700",
  },
});
