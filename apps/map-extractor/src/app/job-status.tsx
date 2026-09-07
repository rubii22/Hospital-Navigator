import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";

export default function JobStatusScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { activeSessionId, apiSessions } = useExtractorContext();
  const activeSession = apiSessions.find(
    (s) => String(s.id) === String(activeSessionId),
  );
  const dt = activeSession ? new Date(activeSession.created_at) : new Date();

  const job = {
    jobId: activeSession
      ? `JOB-${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(activeSession.id).padStart(4, "0")}`
      : "JOB-2026-08-28-0001",
    completedAt: dt.toLocaleString(),
    status:
      activeSession?.status === "completed" ||
      activeSession?.status === "success"
        ? "Processing Complete!"
        : "Processing...",
    nextSteps: [
      { title: "Review AI Results", desc: "Check detected map and features" },
      { title: "Sync to Cloud", desc: "Save and sync to central server" },
    ],
  };

  return (
    <View style={styles.container}>
      <Heading
        tag="STEP 8"
        title="Job Status"
        subtitle="AI pipeline execution state and resulting dataset overview."
      />

      <View style={styles.checkWrap}>
        <View
          style={[
            styles.bigCheckCircle,
            { backgroundColor: theme.successSoft, borderColor: theme.success },
          ]}
        >
          <AppIcon name="checkCircle" size={48} color={theme.success} />
        </View>
        <Text style={[styles.statusText, { color: theme.text }]}>
          {job.status}
        </Text>
      </View>

      <Card style={{ gap: 8 }}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
            Job ID
          </Text>
          <Text style={[styles.infoVal, { color: theme.accent }]}>
            {job.jobId}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
            Completed At
          </Text>
          <Text style={[styles.infoVal, { color: theme.text }]}>
            {job.completedAt}
          </Text>
        </View>
      </Card>

      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
        NEXT STEPS
      </Text>

      <View style={{ gap: 10 }}>
        {job.nextSteps.map((step, idx) => (
          <Card
            key={idx}
            onPress={() =>
              router.push(idx === 0 ? "/point-cloud-viewer" : "/sync-cloud")
            }
          >
            <View style={styles.stepRow}>
              <View
                style={[
                  styles.stepIconWrap,
                  { backgroundColor: theme.primarySoft },
                ]}
              >
                <AppIcon
                  name={idx === 0 ? "eye" : "cloud"}
                  size={20}
                  color={theme.accent}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: theme.text }]}>
                  {step.title}
                </Text>
                <Text style={[styles.stepDesc, { color: theme.textMuted }]}>
                  {step.desc}
                </Text>
              </View>
              <AppIcon name="chevronRight" size={18} color={theme.textMuted} />
            </View>
          </Card>
        ))}
      </View>

      <Pressable
        onPress={() => router.push("/point-cloud-viewer")}
        style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.btnText}>View Results</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  checkWrap: { alignItems: "center", marginVertical: 12, gap: 8 },
  bigCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 999,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: { fontSize: 20, fontWeight: "800" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: { fontSize: 13, fontWeight: "600" },
  infoVal: { fontSize: 13, fontWeight: "800" },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 4,
  },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: { fontSize: 14, fontWeight: "800" },
  stepDesc: { fontSize: 11 },
  btnPrimary: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
});
