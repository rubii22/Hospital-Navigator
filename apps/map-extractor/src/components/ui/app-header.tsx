import React from "react";
import { View, Text, Pressable } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { AppLogo } from "./app-logo";
import { AppIcon } from "./app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { createStyles } from "@/styles/app-header.styles";

export const extractorScreens: [string, string][] = [
  ["/dashboard", "1. Dashboard"],
  ["/select-location", "2. Select Location"],
  ["/start-scan", "3. Start Scan"],
  ["/scanning-live", "4. Scanning (Live)"],
  ["/scan-summary", "5. Scan Summary"],
  ["/upload-process", "6. Upload & Process"],
  ["/ai-processing", "7. AI Processing"],
  ["/job-status", "8. Job Status"],
  ["/point-cloud-viewer", "9. 3D Point Cloud Viewer"],
  ["/ai-detections", "10. AI Detections (Overlay)"],
  ["/map-preview-2d", "11. 2D Map Preview"],
  ["/ocr-results", "12. OCR Results"],
  ["/map-editor", "13. Manual Review & Edit"],
  ["/map-details", "14. Map Details & Metadata"],
  ["/sync-cloud", "15. Sync to Cloud"],
  ["/my-scans", "16. Session History"],
];

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { menuOpen, setMenuOpen } = useExtractorContext();
  const { user, logout } = useAuth();

  const isDashboard = pathname === "/" || pathname === "/dashboard";

  return (
    <>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surfaceMuted,
            borderColor: theme.border,
          },
        ]}
      >
        {!isDashboard ? (
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <AppIcon name="chevronRight" size={20} color={theme.text} />
          </Pressable>
        ) : (
          <AppLogo />
        )}

        {/* <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: theme.text }]}>Online Map</Text>
          <Text style={[styles.sub, { color: theme.accent }]}>
            Extractor UI
          </Text>
        </View> */}

        <Pressable
          onPress={() => setMenuOpen(!menuOpen)}
          style={[
            styles.menuBtn,
            { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
          ]}
        >
          <AppIcon name="menu" size={20} color={theme.text} />
        </Pressable>
      </View>

      {menuOpen && (
        <View
          style={[
            styles.menuDropdown,
            {
              backgroundColor: theme.surfaceMuted,
              borderColor: theme.borderHighlight,
            },
          ]}
        >
          <Text style={[styles.menuHeader, { color: theme.textMuted }]}>
            EXTRACTOR FLOW SCREENS
          </Text>
          <View style={styles.menuGrid}>
            {extractorScreens.map(([path, label]) => {
              const isActive =
                pathname === path ||
                (path === "/dashboard" && pathname === "/");
              return (
                <Pressable
                  key={path}
                  onPress={() => {
                    setMenuOpen(false);
                    router.push(path as any);
                  }}
                  style={[
                    styles.menuItem,
                    isActive
                      ? {
                          backgroundColor: theme.primary,
                          borderColor: theme.accent,
                        }
                      : {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                        },
                  ]}
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      isActive
                        ? { color: "#ffffff", fontWeight: "800" }
                        : { color: theme.text },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Logout Button */}
          {user && (
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                logout();
              }}
              style={[
                styles.menuItem,
                {
                  backgroundColor: theme.dangerSoft,
                  borderColor: theme.danger,
                  marginTop: 8,
                  width: "100%",
                  alignItems: "center",
                  paddingVertical: 8,
                },
              ]}
            >
              <Text
                style={{ color: "#ff6b6b", fontWeight: "800", fontSize: 12 }}
              >
                Logout ({user.full_name})
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </>
  );
}
