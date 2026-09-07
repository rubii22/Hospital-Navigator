import React, { useState } from "react";
<<<<<<< HEAD
import { View, Switch, Text, Pressable } from "react-native";
=======
import { View, Switch, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
import { useTheme } from "@/hooks/useTheme";
import { useAppContext } from "@/context/AppContext";
import { createStyles } from "@/styles/shared.styles";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
<<<<<<< HEAD
=======
import { AppButton } from "@/components/ui/app-button";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688

export default function Settings() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
<<<<<<< HEAD
  const { preferences, updatePreferences, isOffline, setIsOffline, downloadedHospitalIds } = useAppContext();

  const [languageIndex, setLanguageIndex] = useState(0);
  const languages = ["English (US)", "Urdu (اردو)", "Arabic (العربية)", "Spanish (Español)"];

  const handleCycleLanguage = () => {
    const nextIdx = (languageIndex + 1) % languages.length;
    setLanguageIndex(nextIdx);
    updatePreferences({ language: languages[nextIdx] });
  };

  return (
    <View>
      <Heading tag="SYSTEM" title="App Settings" body="Manage audio, language, display, and offline storage settings." />

      <Card style={s.setting}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={s.rowTitle}>Voice Audio Prompts</Text>
          <Text style={s.small}>Hear spoken turn-by-turn indoor directions</Text>
        </View>
        <Switch
          value={preferences.voiceGuidance}
          onValueChange={(val) => updatePreferences({ voiceGuidance: val })}
          thumbColor={theme.text}
          trackColor={{ false: theme.surfaceMuted, true: theme.primary }}
        />
      </Card>

      <Card style={s.setting}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={s.rowTitle}>Voice & Navigation Language</Text>
          <Text style={s.small}>Tap to switch language</Text>
        </View>
        <Pressable
          onPress={handleCycleLanguage}
          style={{ backgroundColor: theme.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
        >
          <Text style={{ color: theme.primary, fontWeight: "700", fontSize: 13 }}>
            {preferences.language || languages[languageIndex]} ▾
          </Text>
        </Pressable>
      </Card>

      <Card style={s.setting}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={s.rowTitle}>High Contrast Display</Text>
          <Text style={s.small}>Enhanced visual contrast for readability</Text>
        </View>
        <Switch
          value={preferences.highContrast}
          onValueChange={(val) => updatePreferences({ highContrast: val })}
          thumbColor={theme.text}
          trackColor={{ false: theme.surfaceMuted, true: theme.primary }}
        />
      </Card>

      <Card style={s.setting}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={s.rowTitle}>Force Offline Mode</Text>
          <Text style={s.small}>Use local cache only, avoiding network requests</Text>
        </View>
        <Switch
          value={isOffline}
          onValueChange={setIsOffline}
          thumbColor={theme.text}
          trackColor={{ false: theme.surfaceMuted, true: theme.primary }}
        />
      </Card>

      <Text style={s.section}>STORAGE STATUS</Text>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <AppIcon name="download" size={20} color={theme.success} />
          <View style={{ flex: 1 }}>
            <Text style={s.rowTitle}>{downloadedHospitalIds.length} Hospital Map Packages Cached</Text>
            <Text style={s.small}>Offline spatial tiles ready for instant navigation</Text>
          </View>
        </View>
      </Card>
=======
  const { isOfflineMode, setIsOfflineMode, hospital, refreshHospitalData } =
    useAppContext();

  const [accessibleRouting, setAccessibleRouting] = useState(true);
  const [avoidStairs, setAvoidStairs] = useState(true);
  const [voiceAlerts, setVoiceAlerts] = useState(false);
  const [highContrast, setHighContrast] = useState(true);

  return (
    <View style={{ gap: 14 }}>
      <Heading tag="PREFERENCES" title="Navigation & Accessibility" />

      {/* Mobility & Routing Options */}
      <View style={{ gap: 8 }}>
        <Text style={s.section}>ROUTING PROFILE</Text>

        <Card>
          <View style={localStyles.settingRow}>
            <View style={s.flex}>
              <Text style={s.rowTitle}>Wheelchair Accessible Routes</Text>
              <Text style={s.small}>
                Prioritizes wide corridors, ramps and automatic doors
              </Text>
            </View>
            <Switch
              value={accessibleRouting}
              onValueChange={setAccessibleRouting}
              trackColor={{ false: theme.surfaceMuted, true: theme.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={s.line} />

          <View style={localStyles.settingRow}>
            <View style={s.flex}>
              <Text style={s.rowTitle}>Avoid Stairs (Elevators Only)</Text>
              <Text style={s.small}>
                Routes vertical floor transitions exclusively via elevator banks
              </Text>
            </View>
            <Switch
              value={avoidStairs}
              onValueChange={setAvoidStairs}
              trackColor={{ false: theme.surfaceMuted, true: theme.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </Card>
      </View>

      {/* Audio & Guidance */}
      <View style={{ gap: 8 }}>
        <Text style={s.section}>GUIDANCE & DISPLAY</Text>

        <Card>
          <View style={localStyles.settingRow}>
            <View style={s.flex}>
              <Text style={s.rowTitle}>Voice Turn Prompts</Text>
              <Text style={s.small}>
                Announce upcoming hallway turns and floor arrivals
              </Text>
            </View>
            <Switch
              value={voiceAlerts}
              onValueChange={setVoiceAlerts}
              trackColor={{ false: theme.surfaceMuted, true: theme.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={s.line} />

          <View style={localStyles.settingRow}>
            <View style={s.flex}>
              <Text style={s.rowTitle}>High Contrast Medical Mode</Text>
              <Text style={s.small}>
                Optimized contrast for clinical wayfinding
              </Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: theme.surfaceMuted, true: theme.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </Card>
      </View>

      {/* QR Localization & Calibration */}
      <View style={{ gap: 8 }}>
        <Text style={s.section}>INDOOR LOCALIZATION</Text>

        <Card>
          <View style={localStyles.settingRow}>
            <View style={s.flex}>
              <Text style={s.rowTitle}>QR Anchor Positioning</Text>
              <Text style={s.small}>
                Scan nearest wall QR plate to pinpoint current room
              </Text>
            </View>
            <AppIcon name="qr" size={20} color={theme.primary} />
          </View>
          <AppButton
            label="Scan QR Anchor Plate"
            variant="secondary"
            onPress={() => router.push("/route")}
          />
        </Card>
      </View>

      {/* Offline Data & Sync */}
      <View style={{ gap: 8 }}>
        <Text style={s.section}>DATA & SYSTEM</Text>

        <Card>
          <View style={localStyles.settingRow}>
            <View style={s.flex}>
              <Text style={s.rowTitle}>Current Facility</Text>
              <Text style={s.small}>
                {hospital ? hospital.name : "No hospital selected"}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/hospital")}
              style={{
                backgroundColor: theme.primarySoft,
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                Change
              </Text>
            </Pressable>
          </View>

          <View style={s.line} />

          <AppButton
            label="Sync Latest Hospital Map"
            variant="secondary"
            onPress={async () => {
              await refreshHospitalData();
              router.push("/download");
            }}
          />
        </Card>
      </View>
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
    </View>
  );
}

const localStyles = StyleSheet.create({
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
});
