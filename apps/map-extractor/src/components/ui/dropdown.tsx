import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { AppIcon } from "./app-icon";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  value: string;
  options: (DropdownOption | string)[];
  onSelect: (val: string) => void;
  placeholder?: string;
}

export function Dropdown({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select an option",
}: DropdownProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const formattedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt,
  );

  const selectedOption = formattedOptions.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      )}

      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        style={[
          styles.trigger,
          {
            backgroundColor: theme.surfaceMuted,
            borderColor: isOpen ? theme.borderHighlight : theme.border,
          },
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            { color: selectedOption ? theme.text : theme.textMuted },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <View style={{ transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}>
          <AppIcon name="chevronDown" size={16} color={theme.textMuted} />
        </View>
      </Pressable>

      {isOpen && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: theme.surfaceRaised,
              borderColor: theme.borderHighlight,
            },
          ]}
        >
          {formattedOptions.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  setIsOpen(false);
                }}
                style={[
                  styles.option,
                  isSelected && { backgroundColor: theme.primarySoft },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: isSelected ? theme.accent : theme.text },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: "100%",
    position: "relative",
    zIndex: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
  trigger: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerText: {
    fontSize: 14,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    padding: 6,
    gap: 2,
    maxHeight: 200,
    overflow: "hidden",
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
