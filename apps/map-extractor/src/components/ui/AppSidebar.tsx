import React from "react";
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useExtractorContext } from "@/context/ExtractorContext";
import { AppIcon, AppIconName } from "./app-icon";
import { styles } from "@/styles/app-sidebar.styles";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const { sidebarMode, setSidebarMode } = useExtractorContext();

  const isExpanded = sidebarMode === "expanded";

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (sidebarMode === "expanded") {
      setSidebarMode("icons");
    } else {
      setSidebarMode("expanded");
    }
  };

  const handleHide = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSidebarMode("invisible");
    showToast("Sidebar hidden. Tap the arrow at the top-left to show it.", "info");
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast("Logged out successfully", "info");
    } catch (err) {
      showToast("Failed to log out", "error");
    }
  };

  const menuItems: [string, string, AppIconName][] = [
    ["/", "Home", "home"],
    ["/my-scans", "Scans", "fileText"],
    ["/start-scan", "Scan", "scan"],
    ["/upload-process", "Upload", "upload"],
    ["/my-hospitals", "Hospitals", "hospital"],
  ];

  return (
    <View style={[styles.sidebarContainer, { width: isExpanded ? 160 : 64 }]}>
      <BlurView intensity={35} tint="dark" style={[styles.blurWrap, { backgroundColor: "rgba(10, 30, 24, 0.4)" }]}>
        
        {/* Top Logo Section */}
        <View style={styles.topSection}>
          <Pressable onPress={toggleExpand} style={styles.logoContainer}>
            <AppIcon name="layers" size={20} color="#10b981" />
          </Pressable>

          {/* Menu Items */}
          <View style={styles.menuList}>
            {menuItems.map(([path, label, icon]) => {
              const isActive = pathname === path;
              return (
                <Pressable
                  key={label}
                  onPress={() => router.push(path as any)}
                  style={[
                    styles.menuItem,
                    isActive && styles.activeMenuItem,
                    { justifyContent: isExpanded ? "flex-start" : "center" },
                  ]}
                >
                  <AppIcon
                    name={icon}
                    size={18}
                    color={isActive ? "#064e3b" : "#ffffff"}
                  />
                  {isExpanded && (
                    <Text
                      style={[
                        styles.itemText,
                        { color: isActive ? "#064e3b" : "#94a3b8" },
                      ]}
                    >
                      {label}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Hide Sidebar Button */}
          <Pressable
            onPress={handleHide}
            style={[
              styles.menuItem,
              {
                justifyContent: isExpanded ? "flex-start" : "center",
                marginBottom: 8,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            ]}
          >
            <Feather name="chevron-left" size={18} color="#94a3b8" />
            {isExpanded && (
              <Text style={[styles.itemText, { color: "#94a3b8" }]}>
                Hide Sidebar
              </Text>
            )}
          </Pressable>

          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            style={[
              styles.logoutBtn,
              { justifyContent: isExpanded ? "flex-start" : "center" },
            ]}
          >
            <Feather name="log-out" size={18} color="#f43f5e" />
            {isExpanded && (
              <Text style={[styles.itemText, { color: "#f43f5e" }]}>
                Logout
              </Text>
            )}
          </Pressable>
        </View>

      </BlurView>
    </View>
  );
}
