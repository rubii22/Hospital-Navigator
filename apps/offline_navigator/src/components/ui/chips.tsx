import React from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";

export function Chips({
  values,
  active,
  onSelect,
}: {
  values?: string[];
  active?: string;
  onSelect?: (value: string) => void;
}) {
  const theme = useTheme();
  const s = createStyles(theme);

  if (!values || !Array.isArray(values) || values.length === 0) {
    return null;
  }

  return (
    <View style={s.chips}>
      {values.map((x, i) => {
        const strVal = String(x ?? "");
        const isSelected = active !== undefined ? active === strVal : i === 0;
        return (
          <Pressable
            key={`chip_${strVal}_${i}`}
            onPress={() => onSelect?.(strVal)}
          >
            <Text style={isSelected ? s.chipOn : s.chip}>{strVal}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
