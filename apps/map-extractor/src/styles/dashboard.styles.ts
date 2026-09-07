import { StyleSheet } from "react-native";
import { ExtractorTheme } from "@/constants/theme";

export const createStyles = (theme: ExtractorTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      gap: 16,
      position: "relative",
    },
    watermarkBg: {
      position: "absolute",
      top: "20%",
      left: "15%",
      right: "15%",
      bottom: "20%",
      opacity: 0.05,
      zIndex: -1,
    },
    logoImg: {
      width: "100%",
      height: "100%",
      marginTop: 100,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "800",
      color: theme.textMuted,
      letterSpacing: 0.5,
      marginTop: 20,
      marginBottom: 8,
    },
    hospitalList: {
      gap: 8,
    },
    hospitalItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      marginBottom: 2,
      borderRadius: 20,
      gap: 14,
    },
    hospitalItemActive: {
      borderColor: theme.warning,
      backgroundColor: theme.warningSoft,
    },
    iconWrap: {
      width: 38,
      height: 38,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.surfaceMuted,
    },
    iconWrapActive: {
      backgroundColor: theme.warningSoft,
    },
    hName: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
    },
    hNameActive: {
      color: theme.warning,
      fontWeight: "bold",
    },
    emptyWrap: {
      minHeight: 120,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    emptyText: {
      fontSize: 12,
      textAlign: "center",
      color: theme.textMuted,
    },
    emptyBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: theme.warning,
      marginTop: 6,
    },
    emptyBtnText: {
      color: "#ffffff",
      fontSize: 11,
      fontWeight: "800",
    },
  });
