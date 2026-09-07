import {
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/app-button.styles";
import { BlurView } from "expo-blur";

export function AppButton({
  label,
  icon,
  variant = "primary",
  style,
  ...props
}: Omit<PressableProps, "style"> & {
  label: string;
  icon?: string;
  variant?: "primary" | "secondary" | "danger";
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const inner = (
    <View style={styles.inner}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.label}>{label}</Text>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        style,
      ]}
    >
      {variant === "secondary" ? (
        <BlurView
          intensity={theme.glassTint === "dark" ? 40 : 80}
          tint={theme.glassTint}
          style={[StyleSheet.absoluteFill, styles.inner]}
        >
          {inner}
        </BlurView>
      ) : (
        inner
      )}
    </Pressable>
  );
}

import { StyleSheet } from "react-native";
