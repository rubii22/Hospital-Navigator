import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { PointCloudCanvas } from "@/components/ui/point-cloud-canvas";
import { AppIcon } from "@/components/ui/app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";

export default function PointCloudViewerScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    selectedBuilding,
    selectedFloor,
    activeSessionId,
    apiPointCloud,
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
    if (targetSessionId && (!apiPointCloud || !apiPointCloud.points || apiPointCloud.points.length === 0)) {
      fetchSessionArtifacts(targetSessionId);
    }
  }, [activeSessionId, apiSessions, apiPointCloud]);

  const [activeToggle, setActiveToggle] = useState("Color");

  const toggles = ["Color", "Elevation", "Intensity", "Grid"];
  const controls = [
    { label: "Rotate", icon: "rotate" },
    { label: "Pan", icon: "sliders" },
    { label: "Zoom", icon: "maximize" },
    { label: "Reset", icon: "refresh" },
  ];

  return (
    <View style={styles.container}>
      <Heading
        tag="STEP 9"
        title="3D Point Cloud Viewer"
        subtitle={`${selectedBuilding} - ${selectedFloor}`}
      />

      <View style={styles.viewerWrap}>
        <PointCloudCanvas height={280} />

        {/* Right side mode toggles overlay */}
        <View style={styles.rightToggles}>
          {toggles.map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setActiveToggle(mode)}
              style={[
                styles.toggleBtn,
                activeToggle === mode
                  ? { backgroundColor: theme.primary, borderColor: theme.accent }
                  : { backgroundColor: "rgba(10, 15, 29, 0.8)", borderColor: theme.border },
              ]}
            >
              <Text style={styles.toggleText}>{mode}</Text>
            </Pressable>
          ))}
        </View>

        {/* Bottom controls toolbar */}
        <View style={[styles.controlsBar, { backgroundColor: "rgba(10, 15, 29, 0.9)", borderColor: theme.borderHighlight }]}>
          {controls.map((ctrl) => (
            <Pressable key={ctrl.label} style={styles.ctrlBtn}>
              <AppIcon name={ctrl.icon as any} size={18} color={theme.text} />
              <Text style={[styles.ctrlText, { color: theme.textMuted }]}>{ctrl.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        onPress={() => router.push("/ai-detections")}
        style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.btnText}>Next: AI Results</Text>
        <AppIcon name="chevronRight" size={18} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  viewerWrap: { position: "relative" },
  rightToggles: { position: "absolute", right: 12, top: 12, gap: 6, zIndex: 10 },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleText: { color: "#ffffff", fontSize: 10, fontWeight: "700" },
  controlsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: -8,
  },
  ctrlBtn: { alignItems: "center", gap: 4 },
  ctrlText: { fontSize: 10, fontWeight: "600" },
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
