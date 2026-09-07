import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export function Heading({
  tag,
  title,
  subtitle,
}: {
  tag?: string;
  title: string;
  subtitle?: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {tag && <Text style={[styles.tag, { color: theme.accent }]}>{tag}</Text>}
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.sub, { color: theme.textMuted }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4, marginBottom: 16 },
  tag: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" },
  title: { fontSize: 24, lineHeight: 30, fontWeight: "800" },
  sub: { fontSize: 13, lineHeight: 18 },
});
