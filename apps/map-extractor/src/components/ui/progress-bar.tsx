import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export function ProgressBar({
  label,
  percent,
  showLabel = true,
}: {
  label?: string;
  percent: number;
  showLabel?: boolean;
}) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
          <Text style={[styles.percent, { color: theme.accent }]}>{percent}%</Text>
        </View>
      )}
      <View style={[styles.track, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(Math.max(percent, 0), 100)}%`, backgroundColor: theme.primary },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", gap: 6, marginVertical: 4 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 13, fontWeight: "700" },
  percent: { fontSize: 13, fontWeight: "800" },
  track: { height: 10, borderRadius: 999, borderWidth: 1, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 999 },
});
