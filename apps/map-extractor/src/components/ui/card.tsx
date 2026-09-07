import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export function Card({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}) {
  const theme = useTheme();
  const Component = onPress ? Pressable : View;

  return (
    <Component
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.borderHighlight },
        style,
      ]}
    >
      {children}
    </Component>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
});
