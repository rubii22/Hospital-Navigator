import { StyleSheet } from "react-native";
import { ExtractorTheme } from "@/constants/theme";

export const createStyles = (theme: ExtractorTheme) =>
  StyleSheet.create({
    outerContainer: {
      position: "absolute",
      bottom: 16,
      left: 16,
      right: 16,
      height: 64,
      backgroundColor: "transparent",
      zIndex: 999,
    },
    blurBar: {
      flex: 1,
      borderRadius: 32,
      borderWidth: 1.5,
      borderColor: theme.border,
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.35)",
    },
    row: {
      flexDirection: "row",
      height: "100%",
      alignItems: "center",
      justifyContent: "space-around",
      paddingHorizontal: 16,
    },
    tabItem: {
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },
    tabLabel: {
      fontSize: 10,
      fontWeight: "700",
    },
  });
