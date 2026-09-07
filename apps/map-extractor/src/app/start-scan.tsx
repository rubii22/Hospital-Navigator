import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";

const scanInstructions = [
  { icon: "walk", title: "Walk slowly and steadily" },
  { icon: "camera", title: "Capture all areas" },
  { icon: "target", title: "Focus on corridors, rooms and signs" },
  { icon: "sun", title: "Good lighting improves accuracy" },
];

export default function StartScanScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { selectedBuilding, selectedFloor } = useExtractorContext();

  return (
    <View style={styles.container}>
      <Heading
        tag="STEP 3"
        title="Start New Scan"
        subtitle="Review instructions and tap start to begin capturing floor geometry."
      />

      <Card style={{ backgroundColor: theme.surfaceRaised }}>
        <View style={styles.locationHeader}>
          <View
            style={[styles.locIcon, { backgroundColor: theme.primarySoft }]}
          >
            <AppIcon name="box" size={24} color={theme.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.locTitle, { color: theme.text }]}>
              {selectedBuilding}
            </Text>
            <Text style={[styles.locSub, { color: theme.textMuted }]}>
              {selectedFloor}
            </Text>
          </View>
          <Pressable onPress={() => router.push("/select-location")}>
            <AppIcon name="chevronRight" size={20} color={theme.textMuted} />
          </Pressable>
        </View>
      </Card>

      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
        INSTRUCTIONS
      </Text>

      <Card style={{ gap: 12 }}>
        {scanInstructions.map((item, idx) => (
          <View key={idx} style={styles.instructionRow}>
            <View
              style={[
                styles.bulletIcon,
                { backgroundColor: theme.primarySoft },
              ]}
            >
              <AppIcon name="check" size={14} color={theme.accent} />
            </View>
            <Text style={[styles.instructionText, { color: theme.text }]}>
              {item.title}
            </Text>
          </View>
        ))}
      </Card>

      <View style={styles.startWrap}>
        <Pressable
          onPress={() => router.push("/scanning-live")}
          style={[styles.bigStartBtn, { backgroundColor: theme.primary }]}
        >
          <View style={styles.innerCircle} />
        </Pressable>
        <Text style={[styles.startText, { color: theme.text }]}>
          Start Scanning
        </Text>
      </View>

      <Pressable
        onPress={() => router.push("/select-location")}
        style={styles.settingsRow}
      >
        <Text style={[styles.settingsText, { color: theme.textMuted }]}>
          Scan Settings
        </Text>
        <AppIcon name="chevronRight" size={16} color={theme.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  locationHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  locIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  locTitle: { fontSize: 16, fontWeight: "800" },
  locSub: { fontSize: 12 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 4,
  },
  instructionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  bulletIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: { fontSize: 13, fontWeight: "600" },
  startWrap: { alignItems: "center", marginVertical: 16, gap: 10 },
  bigStartBtn: {
    width: 84,
    height: 84,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 20px rgba(217, 119, 6, 0.5)",
  },
  innerCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  startText: { fontSize: 15, fontWeight: "800" },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 4,
  },
  settingsText: { fontSize: 12, fontWeight: "700" },
});
