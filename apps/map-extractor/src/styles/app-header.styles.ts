import { StyleSheet } from "react-native";
import { ExtractorTheme } from "@/constants/theme";

export const createStyles = (theme: ExtractorTheme) =>
  StyleSheet.create({
    header: {
      height: 64,
      paddingHorizontal: 16,
      borderBottomWidth: 1.5,
      borderColor: theme.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 99,
    },
    backBtn: {
      padding: 8,
      marginLeft: -8,
    },
    menuBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: theme.border,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.surface,
    },
    menuDropdown: {
      position: "absolute",
      top: 68,
      left: 16,
      right: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.border,
      padding: 16,
      zIndex: 999,
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.25)",
    },
    menuHeader: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
      marginBottom: 12,
      color: theme.textMuted,
    },
    menuGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    menuItem: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    menuItemActive: {
      backgroundColor: theme.primary,
      borderColor: theme.accent,
    },
    menuItemText: {
      fontSize: 12,
      color: theme.text,
    },
    logoutBtn: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
  });
