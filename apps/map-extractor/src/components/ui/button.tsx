import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "outline" | "text";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = "primary",
  style,
  textStyle,
}: ButtonProps) {
  const theme = useTheme();

  const getButtonStyles = (): ViewStyle[] => {
    const baseStyle: ViewStyle = {
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: "transparent",
    };

    let variantStyle: ViewStyle = {};
    switch (variant) {
      case "primary":
        variantStyle = {
          backgroundColor: theme.primary,
        };
        break;
      case "secondary":
        variantStyle = {
          backgroundColor: theme.surfaceRaised,
          borderColor: theme.borderHighlight,
        };
        break;
      case "danger":
        variantStyle = {
          backgroundColor: theme.dangerSoft,
          borderColor: theme.danger,
        };
        break;
      case "outline":
        variantStyle = {
          backgroundColor: "transparent",
          borderColor: theme.borderHighlight,
        };
        break;
      case "text":
        variantStyle = {
          backgroundColor: "transparent",
          height: "auto",
          paddingHorizontal: 0,
          borderWidth: 0,
        };
        break;
    }

    return [baseStyle, variantStyle, style || {}];
  };

  const getTextColor = (): string => {
    switch (variant) {
      case "primary":
        return "#ffffff";
      case "danger":
        return "#ff6b6b";
      case "text":
      case "outline":
        return theme.accent;
      default:
        return theme.text;
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        getButtonStyles(),
        {
          opacity: isDisabled ? 0.7 : 1,
        },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontWeight: variant === "text" ? "700" : "800",
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
  },
});
