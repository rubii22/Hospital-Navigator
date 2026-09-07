import { StyleSheet } from "react-native";
import { ExtractorTheme } from "@/constants/theme";

export const createStyles = (theme: ExtractorTheme) =>
  StyleSheet.create({
    container: {
      gap: 12,
    },
    uploadCard: {
      alignItems: "center",
      paddingVertical: 20,
      gap: 6,
    },
    cloudWrap: {
      width: 64,
      height: 64,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    fileName: {
      fontSize: 16,
      fontWeight: "800",
      textAlign: "center",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "700",
      textAlign: "center",
    },
    fileSize: {
      fontSize: 13,
      marginBottom: 6,
    },
    checkRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    checkText: {
      fontSize: 13,
      fontWeight: "700",
    },
    checkDetail: {
      fontSize: 11,
      marginTop: 2,
    },
    badge: {
      paddingVertical: 2,
      paddingHorizontal: 8,
      borderRadius: 999,
      alignSelf: "center",
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "800",
    },
    btnPrimary: {
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    btnText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "800",
    },
    btnSecondary: {
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    btnSecondaryText: {
      fontSize: 14,
      fontWeight: "700",
    },
  });
