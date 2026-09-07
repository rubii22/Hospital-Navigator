import { StyleSheet } from "react-native";
import { ExtractorTheme } from "@/constants/theme";

export const createStyles = (theme: ExtractorTheme) =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      backgroundColor: theme.background,
    },
    innerContainer: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
      justifyContent: "space-between",
      minHeight: 650,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 40,
    },
    backBtn: {
      padding: 8,
      marginLeft: -8,
    },
    header: {
      alignItems: "flex-start",
      marginBottom: 40,
    },
    titleText: {
      fontSize: 36,
      fontWeight: "bold",
      color: theme.text,
    },
    formWrap: {
      flex: 1,
      justifyContent: "flex-start",
      gap: 24,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingVertical: 10,
      height: 52,
    },
    inputRowActive: {
      borderBottomColor: theme.warning,
    },
    inputRowError: {
      borderBottomColor: theme.danger,
    },
    inputField: {
      flex: 1,
      color: theme.text,
      fontSize: 16,
      paddingLeft: 12,
      height: "100%",
      paddingVertical: 0,
    },
    errorText: {
      color: theme.danger,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 8,
    },
    submitBtnWrap: {
      alignItems: "center",
      marginTop: 20,
    },
    submitBtn: {
      width: "100%",
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.surfaceRaised,
      justifyContent: "center",
      alignItems: "center",
      boxShadow: "0 6px 10px rgba(0, 0, 0, 0.3)",
    },
    submitBtnText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "bold",
    },
    toggleModeWrap: {
      alignItems: "center",
      marginTop: 24,
    },
    toggleModeText: {
      color: theme.textMuted,
      fontSize: 14,
    },
    toggleModeHighlight: {
      color: theme.text,
      fontWeight: "bold",
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      marginTop: "auto",
      paddingTop: 20,
    },
    footerActionBtn: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.surfaceRaised,
      justifyContent: "center",
      alignItems: "center",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
    },
  });
