import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PointCloudCanvas } from "@/components/ui/point-cloud-canvas";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";

const aiSteps = [
  { name: "1. Point Cloud Generation" },
  { name: "2. Object Detection" },
  { name: "3. Text & OCR Recognition" },
  { name: "4. Geometry Extraction" },
  { name: "5. Vector Map Generation" },
];

export default function AIProcessingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    activeSessionId,
    pollJobProgress,
    processedSessionIds,
    markSessionProcessed,
  } = useExtractorContext();

  const isAlreadyProcessed =
    !!activeSessionId && processedSessionIds.includes(activeSessionId);

  const [stepPrc, setStepPrc] = useState(
    isAlreadyProcessed ? [100, 100, 100, 100, 100] : [0, 0, 0, 0, 0],
  );

  useEffect(() => {
    if (isAlreadyProcessed) {
      return;
    }

    if (!activeSessionId) {
      // Fallback: static mock simulation
      setStepPrc([100, 100, 80, 60, 20]);
      const timer = setInterval(() => {
        setStepPrc((prev) => {
          const next = [...prev];
          if (next[2] < 100) next[2] += 5;
          else if (next[3] < 100) next[3] += 10;
          else if (next[4] < 100) next[4] += 15;
          return next;
        });
      }, 1000);
      return () => clearInterval(timer);
    }

    // Active polling from FastAPI server
    const runPoll = async () => {
      try {
        const results = await pollJobProgress(activeSessionId);
        if (results.length > 0) {
          const order = [
            "point_cloud",
            "object_detection",
            "ocr_recognition",
            "geometry_extraction",
            "map_generation",
          ];
          const newPrc = order.map((stepName) => {
            const found = results.find((r) => r.step === stepName);
            return found ? found.progress_percentage : 0;
          });
          setStepPrc(newPrc);
          if (newPrc.every((p) => p >= 100)) {
            markSessionProcessed(activeSessionId);
          }
        }
      } catch (err) {
        console.warn("Polling error:", err);
      }
    };

    // First fetch immediately
    runPoll();

    const interval = setInterval(runPoll, 1500);
    return () => clearInterval(interval);
  }, [activeSessionId, isAlreadyProcessed]);

  const isAllComplete = isAlreadyProcessed || stepPrc.every((p) => p >= 100);

  return (
    <View style={styles.container}>
      <Heading
        tag="STEP 7"
        title="AI Processing"
        subtitle={
          isAllComplete
            ? "AI Extraction Complete! 3D point cloud, visual detections, and vector map are ready."
            : "Processing your scan with deep neural net geometry extraction models..."
        }
      />

      <PointCloudCanvas height={200} />

      <Card style={{ gap: 10 }}>
        {aiSteps.map((step, idx) => (
          <ProgressBar
            key={step.name}
            label={step.name}
            percent={stepPrc[idx]}
          />
        ))}
      </Card>

      <Text style={[styles.subText, { color: theme.textMuted }]}>
        {isAllComplete
          ? "All 5 perception stages completed successfully."
          : "This may take a few minutes."}
      </Text>

      <Pressable
        onPress={() => router.push("/job-status")}
        style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.btnText}>
          {isAllComplete ? "View Results & Job Status" : "View Job Status"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  subText: { textAlign: "center", fontSize: 12, fontWeight: "600" },
  btnPrimary: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
});
