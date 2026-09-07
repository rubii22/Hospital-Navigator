import { StyleSheet } from "react-native";
import { Theme, Radius, Space } from "@/constants/theme";

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      minHeight: 48,
      borderRadius: Radius.md,
      justifyContent: "center",
      paddingHorizontal: Space.md,
      overflow: "hidden",
    },
    primary: { backgroundColor: theme.primary },
    secondary: {
      backgroundColor: theme.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.borderHighlight,
    },
    danger: { backgroundColor: theme.danger },
    pressed: { opacity: 0.78 },
    inner: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: Space.xs,
    },
    label: { color: theme.text, fontSize: 14, fontWeight: "700" },
    icon: { color: theme.text, fontSize: 16, fontWeight: "800" },
  });
