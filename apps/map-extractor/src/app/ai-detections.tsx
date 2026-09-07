import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Chips } from "@/components/ui/chips";
import { FloorplanCanvas } from "@/components/ui/floorplan-canvas";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";

export default function AIDetectionsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    selectedBuilding,
    selectedFloor,
    apiDetections,
    activeSessionId,
    apiSessions,
    setActiveSessionId,
    fetchSessionArtifacts,
  } = useExtractorContext();

  React.useEffect(() => {
    let targetSessionId = activeSessionId;
    if (!targetSessionId && apiSessions && apiSessions.length > 0) {
      targetSessionId = apiSessions[0].id;
      setActiveSessionId(targetSessionId);
    }
    if (targetSessionId && (!apiDetections || apiDetections.length === 0)) {
      fetchSessionArtifacts(targetSessionId);
    }
  }, [activeSessionId, apiSessions]);

  const [activeChip, setActiveChip] = useState("All");

  const chips = ["All", "Rooms", "Objects", "Signs", "POIs"];
  const legend = [
    { label: "Rooms", color: "#6366f1" },
    { label: "Objects", color: "#38bdf8" },
    { label: "Signs", color: "#ef4444" },
    { label: "POIs", color: "#f59e0b" },
    { label: "Others", color: "#10b981" },
  ];

  const detectionCount = apiDetections ? apiDetections.length : 0;

  return (
    <View style={styles.container}>
      <Heading
        tag="STEP 10"
        title="AI Detections (Overlay)"
        subtitle={`${selectedBuilding} - ${selectedFloor} (${detectionCount} Features Detected)`}
      />

      <Chips items={chips} selected={activeChip} onSelect={setActiveChip} />

      <FloorplanCanvas showOverlay={true} height={280} />

      <Card style={styles.legendCard}>
        <Text style={[styles.legendTitle, { color: theme.textMuted }]}>
          DETECTION LEGEND
        </Text>
        <View style={styles.legendRow}>
          {legend.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: item.color }]}
              />
              <Text style={[styles.legendText, { color: theme.text }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Pressable
        onPress={() => router.push("/map-preview-2d")}
        style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.btnText}>Review in 2D Map</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  legendCard: { padding: 12, gap: 8 },
  legendTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: "700" },
  btnPrimary: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
});
