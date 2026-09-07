import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { FloorplanCanvas } from "@/components/ui/floorplan-canvas";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";

export default function MapPreview2DScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    selectedBuilding,
    selectedFloor,
    activeSessionId,
    apiMapData,
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
    if (targetSessionId && !apiMapData) {
      fetchSessionArtifacts(targetSessionId);
    }
  }, [activeSessionId, apiSessions, apiMapData]);

  const mapLegend = [
    { label: "Rooms", color: "#6366f1" },
    { label: "Corridors", color: "#38bdf8" },
    { label: "Doors", color: "#10b981" },
    { label: "POIs", color: "#f59e0b" },
    { label: "Stairs", color: "#ec4899" },
  ];

  return (
    <View style={styles.container}>
      <Heading
        tag="STEP 11"
        title="2D Map Generation (Preview)"
        subtitle={`${selectedBuilding} - ${selectedFloor}`}
      />

      <View style={styles.previewWrap}>
        <FloorplanCanvas showOverlay={false} height={280} />

        {/* Floating action buttons */}
        <View style={styles.floatingTools}>
          <Pressable style={[styles.toolBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppIcon name="layers" size={18} color={theme.text} />
          </Pressable>
          <Pressable style={[styles.toolBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppIcon name="plus" size={18} color={theme.text} />
          </Pressable>
          <Pressable style={[styles.toolBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppIcon name="minus" size={18} color={theme.text} />
          </Pressable>
          <Pressable style={[styles.toolBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppIcon name="maximize" size={18} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <Card style={styles.legendCard}>
        <View style={styles.legendRow}>
          {mapLegend.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Pressable
        onPress={() => router.push("/ocr-results")}
        style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.btnText}>Review & Edit</Text>
        <AppIcon name="chevronRight" size={18} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  previewWrap: { position: "relative" },
  floatingTools: { position: "absolute", right: 12, top: 12, gap: 6, zIndex: 10 },
  toolBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  legendCard: { padding: 12 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: "700" },
  btnPrimary: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
});
