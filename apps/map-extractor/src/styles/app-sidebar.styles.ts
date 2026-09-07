import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  sidebarContainer: {
    height: "94%",
    alignSelf: "center",
    marginLeft: 12,
    marginRight: 6,
    zIndex: 50,
    boxShadow: "4px 12px 20px rgba(0, 0, 0, 0.35)",
  },
  blurWrap: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  topSection: {
    alignItems: "center",
    width: "100%",
    gap: 24,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuList: {
    width: "100%",
    gap: 12,
    paddingHorizontal: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    gap: 12,
    minHeight: 44,
  },
  activeMenuItem: {
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)",
  },
  itemText: {
    fontSize: 13,
    fontWeight: "700",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    gap: 12,
    minHeight: 44,
    width: "100%",
  },
});
