import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface InputProps extends Omit<TextInputProps, "style"> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  label?: string;
  error?: string | null;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  placeholderTextColor,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}: InputProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surfaceMuted,
            borderColor: error ? theme.danger : theme.border,
          },
          disabled && styles.disabledContainer,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              paddingLeft: leftIcon ? 4 : 4,
              paddingRight: rightIcon ? 4 : 4,
            },
          ]}
          placeholderTextColor={placeholderTextColor || theme.textMuted}
          editable={!disabled}
          {...props}
        />

        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>

      {error && (
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontWeight: "400",
    paddingVertical: 0,
  },
  iconLeft: {
    marginRight: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  iconRight: {
    marginLeft: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledContainer: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
});
