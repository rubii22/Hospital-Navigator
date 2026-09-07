import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppIcon } from "./app-icon";
import { useTheme } from "@/hooks/useTheme";

export function AppLogo() {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
        <AppIcon name="scan" size={20} color={theme.accent} />
      </View>
      <View>
        <Text style={[styles.title, { color: theme.text }]}>Map Extractor</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.4)",
  },
  title: { fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  sub: { fontSize: 10, fontWeight: "600" },
});
