import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AppIcon } from "@/components/ui/app-icon";
import { useTheme } from "@/hooks/useTheme";
import { useExtractorContext } from "@/context/ExtractorContext";

export default function SyncCloudScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    selectedBuilding,
    selectedFloor,
    activeSessionId,
    syncedSessionIds,
    markSessionSynced,
  } = useExtractorContext();

  const isAlreadySynced =
    !!activeSessionId && syncedSessionIds.includes(activeSessionId);

  const [progress, setProgress] = useState(isAlreadySynced ? 100 : 0);
  const [statusText, setStatusText] = useState(
    isAlreadySynced
      ? "All elements synced successfully!"
      : "Encrypting local features...",
  );

  useEffect(() => {
    if (isAlreadySynced) {
      setProgress(100);
      setStatusText("All elements synced successfully!");
      return;
    }

    let current = 0;
    const timer = setInterval(() => {
      current += 10;
      if (current >= 100) {
        clearInterval(timer);
        setProgress(100);
        setStatusText("All elements synced successfully!");
        if (activeSessionId) {
          markSessionSynced(activeSessionId);
        }
        setTimeout(() => {
          router.push("/my-scans");
        }, 1200);
      } else {
        setProgress(current);
        if (current >= 80) {
          setStatusText("Saving coordinate matrices...");
        } else if (current >= 40) {
          setStatusText("Uploading localized models...");
        }
      }
    }, 300);

    return () => clearInterval(timer);
  }, [isAlreadySynced, activeSessionId]);

  const sync = {
    statusText,
    progress,
    checklist: [
      {
        name: `Map Geometry & CAD (${selectedBuilding || "Facility"} - ${selectedFloor || "Level"})`,
      },
      { name: "Signage & Waypoint OCR Labels" },
      { name: `Session #${activeSessionId || "41"} AI Pipeline Artifacts` },
    ],
  };

  return (
    <View style={styles.container}>
      <Heading
        tag="STEP 15"
        title="Sync to Cloud"
        subtitle="Encrypting local extracted features and pushing to central hospital server."
      />

      <Card style={styles.syncCard}>
        <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
          <AppIcon name="cloud" size={36} color={theme.accent} />
        </View>
        <Text style={[styles.statusTitle, { color: theme.text }]}>
          {sync.statusText}
        </Text>
      </Card>

      <Card style={{ gap: 10 }}>
        {sync.checklist.map((item) => (
          <View key={item.name} style={styles.itemRow}>
            <AppIcon name="checkCircle" size={18} color={theme.success} />
            <Text style={[styles.itemText, { color: theme.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.itemReady, { color: theme.success }]}>
              Ready
            </Text>
          </View>
        ))}
        <ProgressBar label="Uploading..." percent={sync.progress} />
      </Card>

      <Pressable
        onPress={() => router.push("/my-scans")}
        style={[styles.btnSecondary, { borderColor: theme.borderHighlight }]}
      >
        <Text style={[styles.btnSecondaryText, { color: theme.text }]}>
          Cancel Sync
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  syncCard: { alignItems: "center", paddingVertical: 20, gap: 10 },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: { fontSize: 15, fontWeight: "800" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemText: { flex: 1, fontSize: 13, fontWeight: "700" },
  itemReady: { fontSize: 12, fontWeight: "800" },
  btnSecondary: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnSecondaryText: { fontSize: 14, fontWeight: "700" },
});
