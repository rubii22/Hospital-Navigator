import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { BlurView } from "expo-blur";
import { AppIcon, AppIconName } from "./app-icon";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/app-bottom-tabs.styles";

export function AppBottomTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const styles = createStyles(theme);

  const tabs: [string, string, AppIconName][] = [
    ["/", "Home", "home"],
    ["/my-scans", "Scans", "fileText"],
    ["/start-scan", "Scan", "scan"],
    ["/upload-process", "Upload", "upload"],
    ["/my-hospitals", "Hospitals", "hospital"],
  ];

  return (
    <View style={styles.outerContainer}>
      <BlurView intensity={80} tint="dark" style={[styles.blurBar, { backgroundColor: theme.surfaceMuted }]}>
        <View style={styles.row}>
          {tabs.map(([path, label, icon]) => {
            const isActive = pathname === path;
            const activeColor = theme.warning;
            const inactiveColor = theme.textMuted;
            const color = isActive ? activeColor : inactiveColor;

            return (
              <Pressable
                key={label}
                onPress={() => router.push(path as any)}
                style={styles.tabItem}
              >
                <AppIcon name={icon} size={20} color={color} />
                <Text style={[styles.tabLabel, { color }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}
