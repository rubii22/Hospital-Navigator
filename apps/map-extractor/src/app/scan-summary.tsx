import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { GaugeRing } from "@/components/ui/gauge-ring";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";

export default function ScanSummaryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { data } = useExtractorContext();
  const m = data.summaryMetrics;

  const statsList = [
    { label: "Distance Walked", val: m.distanceWalked },
    { label: "Frames Captured", val: m.framesCaptured.toLocaleString() },
    { label: "Points Captured", val: m.pointsCaptured },
    { label: "Duration", val: m.duration },
    { label: "Areas Covered", val: m.areasCovered },
    { label: "Quality", val: m.quality },
  ];

  return (
    <View style={styles.container}>
      <Heading
        tag="STEP 5"
        title="Scan Summary"
        subtitle="Verification complete. Review captured metric metrics below."
      />

      <GaugeRing rating={m.rating} percent={m.coverage} label="Coverage" />

      <View style={styles.metricsGrid}>
        {statsList.map((stat, i) => (
          <Card key={i} style={styles.statCard}>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{stat.label}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{stat.val}</Text>
          </Card>
        ))}
      </View>

      <Pressable
        onPress={() => router.push("/upload-process")}
        style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.btnText}>Finish Scan</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/start-scan")}
        style={[styles.btnSecondary, { borderColor: theme.borderHighlight }]}
      >
        <Text style={[styles.btnSecondaryText, { color: theme.text }]}>Scan Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "48%", padding: 12, marginBottom: 0, gap: 4 },
  statLabel: { fontSize: 11, fontWeight: "600" },
  statValue: { fontSize: 16, fontWeight: "800" },
  btnPrimary: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  btnSecondary: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: { fontSize: 14, fontWeight: "700" },
});
