import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";

export default function MapDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { activeSessionId, apiSessions, data, selectedBuilding, selectedFloor } = useExtractorContext();
  const activeSession = apiSessions.find((s) => String(s.id) === String(activeSessionId));
  const dt = activeSession ? new Date(activeSession.created_at) : new Date();

  const meta = {
    scanName: activeSession ? `Scan - ${selectedBuilding || "Building"} - ${selectedFloor || "Floor"}` : `${selectedBuilding || "Facility"} - ${selectedFloor || "Main Level"}`,
    description: activeSession ? `Completed indoor mapping session #${activeSession.id} for ${selectedBuilding || "Facility"} - ${selectedFloor || "Level"}` : "Indoor spatial coordinates scan covering clinical departments and navigation pathways.",
    scanDate: dt.toLocaleDateString(),
    scanner: data.user.name || "Active Mapper",
    device: "LiDAR Mobile Scanner",
    size: activeSession && activeSession.frames_count ? `${((activeSession.frames_count * 0.005) + 1.2).toFixed(1)} MB` : "2.4 MB",
  };

  const [scanName, setScanName] = useState(meta.scanName);
  const [desc, setDesc] = useState(meta.description);

  return (
    <View style={styles.container}>
      <Heading
        tag="STEP 14"
        title="Map Details"
        subtitle="Review scan metadata and append descriptions before cloud publishing."
      />

      <Card style={{ gap: 12 }}>
        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Scan Name</Text>
          <TextInput
            value={scanName}
            onChangeText={setScanName}
            style={[styles.input, { color: theme.text, backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: theme.textMuted }]}>Description</Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            multiline={true}
            numberOfLines={3}
            style={[styles.inputMulti, { color: theme.text, backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
          />
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={[styles.metaLabel, { color: theme.textMuted }]}>Scan Date</Text>
            <Text style={[styles.metaVal, { color: theme.text }]}>{meta.scanDate}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={[styles.metaLabel, { color: theme.textMuted }]}>Scanner</Text>
            <Text style={[styles.metaVal, { color: theme.text }]}>{meta.scanner}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={[styles.metaLabel, { color: theme.textMuted }]}>Device</Text>
            <Text style={[styles.metaVal, { color: theme.text }]}>{meta.device}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={[styles.metaLabel, { color: theme.textMuted }]}>Size</Text>
            <Text style={[styles.metaVal, { color: theme.text }]}>{meta.size}</Text>
          </View>
        </View>
      </Card>

      <Pressable
        onPress={() => router.push("/sync-cloud")}
        style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.btnText}>Save & Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  fieldWrap: { gap: 4 },
  label: { fontSize: 12, fontWeight: "700" },
  input: { height: 44, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, fontSize: 13 },
  inputMulti: { height: 72, borderRadius: 10, borderWidth: 1, padding: 10, fontSize: 13, textAlignVertical: "top" },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 4 },
  infoCol: { width: "47%", gap: 2 },
  metaLabel: { fontSize: 11, fontWeight: "600" },
  metaVal: { fontSize: 13, fontWeight: "800" },
  btnPrimary: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
});
