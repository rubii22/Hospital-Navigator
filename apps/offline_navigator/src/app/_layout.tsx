import React from "react";
import { View, Pressable, Text, ScrollView } from "react-native";
import { Slot, usePathname, useRouter } from "expo-router";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import { AppProvider, useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { AppLogo } from "@/components/ui/app-logo";
<<<<<<< HEAD
import { AppIcon } from "@/components/ui/app-icon";
import { AppLoader } from "@/components/ui/app-loader";
=======
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688

const navigationItems: { route: string; label: string; icon: AppIconName }[] = [
  { route: "/dashboard", label: "Dashboard", icon: "menu" },
  { route: "/search", label: "Search & Directory", icon: "search" },
  { route: "/floors", label: "Floor Plans", icon: "floors" },
  { route: "/download", label: "Offline Maps", icon: "download" },
  { route: "/emergency", label: "Emergency", icon: "emergency" },
  { route: "/hospital", label: "Change Hospital", icon: "hospital" },
  { route: "/settings", label: "Settings & Help", icon: "accessibility" },
];

function LayoutContent() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
<<<<<<< HEAD
  const { menu, setMenu, isLoading } = useAppContext();
  if (isLoading) {
    return (
      <SafeAreaView style={s.safe}>
        <AppLoader label="Loading offline navigation maps…" />
      </SafeAreaView>
    );
  }
=======
  const { menu, setMenu, isLoading, isOfflineMode, hospital } = useAppContext();

  if (isLoading) return null;
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688

  const isWelcome = pathname === "/";

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.page}>
        {!isWelcome && (
          <BlurView intensity={80} tint={theme.glassTint} style={s.header}>
            <Pressable
              onPress={() => {
                setMenu(false);
                router.push("/dashboard");
              }}
            >
              <AppLogo />
            </Pressable>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {isOfflineMode && (
                <View
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    borderColor: "rgba(245, 158, 11, 0.4)",
                    borderWidth: 1,
                    paddingVertical: 3,
                    paddingHorizontal: 8,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#f59e0b",
                      fontSize: 10,
                      fontWeight: "800",
                    }}
                  >
                    OFFLINE
                  </Text>
                </View>
              )}
              <Pressable onPress={() => setMenu(!menu)} style={s.menuButton}>
                <AppIcon name="menu" color={theme.text} />
              </Pressable>
            </View>
          </BlurView>
        )}

        {!isWelcome && menu && (
          <BlurView intensity={95} tint={theme.glassTint} style={s.menu}>
            {navigationItems.map((item) => (
              <Pressable
                key={item.route}
                onPress={() => {
                  setMenu(false);
                  router.push(item.route as any);
                }}
                style={[
                  s.menuItem,
                  pathname === item.route && s.menuActive,
                  { flexDirection: "row", alignItems: "center", gap: 10 },
                ]}
              >
                <AppIcon
                  name={item.icon}
                  size={18}
                  color={
                    pathname === item.route ? theme.primary : theme.textMuted
                  }
                />
                <Text
                  style={[
                    s.menuText,
                    pathname === item.route && {
                      color: theme.primary,
                      fontWeight: "800",
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </BlurView>
        )}

        <ScrollView contentContainerStyle={s.content}>
          <Slot />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <LayoutContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
