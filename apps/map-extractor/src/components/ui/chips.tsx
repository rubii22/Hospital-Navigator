import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export function Chips({
  items,
  selected,
  onSelect,
}: {
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isSelected = selected === item;
        return (
          <Pressable
            key={item}
            onPress={() => onSelect(item)}
            style={[
              styles.chip,
              isSelected
                ? { backgroundColor: theme.primary, borderColor: theme.accent }
                : { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text
              style={[
                styles.text,
                isSelected
                  ? { color: "#ffffff", fontWeight: "800" }
                  : { color: theme.textMuted, fontWeight: "600" },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: { fontSize: 12 },
});
