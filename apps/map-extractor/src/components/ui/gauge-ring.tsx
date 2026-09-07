import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export function GaugeRing({
  rating = "Excellent",
  percent = 92,
  label = "Coverage",
}: {
  rating?: string;
  percent?: number;
  label?: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.ring,
          {
            borderColor: theme.success,
            backgroundColor: theme.surfaceMuted,
          },
        ]}
      >
        <Text style={[styles.ratingText, { color: theme.success }]}>{rating}</Text>
        <Text style={[styles.percentText, { color: theme.text }]}>{percent}%</Text>
        <Text style={[styles.labelText, { color: theme.textMuted }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", marginVertical: 16 },
  ring: {
    width: 140,
    height: 140,
    borderRadius: 999,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
  },
  ratingText: { fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  percentText: { fontSize: 34, fontWeight: "800", letterSpacing: -1 },
  labelText: { fontSize: 11, fontWeight: "600" },
});
