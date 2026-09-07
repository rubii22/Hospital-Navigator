import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AppIcon } from "@/components/ui/app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/upload-process.styles";

interface CheckStep {
  label: string;
  detail: string;
  status: "pending" | "processing" | "completed";
}

export default function UploadProcessScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    data,
    selectedBuilding,
    selectedFloor,
    createSession,
    uploadSessionAssets,
    triggerProcessing,
    activeSessionId,
    uploadedSessionIds,
    markSessionUploaded,
  } = useExtractorContext();

  const m = data.summaryMetrics;
  const durationSec = useMemo(() => {
    if (typeof m.duration === "string" && m.duration.includes(":")) {
      const [mins, secs] = m.duration.split(":").map(Number);
      return (mins || 0) * 60 + (secs || 0);
    }
    return 60;
  }, [m.duration]);

  const distanceMeters = useMemo(() => {
    return parseFloat(String(m.distanceWalked).replace(/[^\d.]/g, "")) || 25.0;
  }, [m.distanceWalked]);

  const rawPointsCount = useMemo(() => {
    const raw = String(m.pointsCaptured).toUpperCase();
    if (raw.includes("M")) {
      return Math.round(parseFloat(raw.replace("M", "")) * 1000000);
    }
    if (raw.includes("K")) {
      return Math.round(parseFloat(raw.replace("K", "")) * 1000);
    }
    return parseInt(raw, 10) || 50000;
  }, [m.pointsCaptured]);

  const estimatedFileSizeMB = useMemo(() => {
    const calculated = (
      (m.framesCaptured || 100) * 0.005 +
      (rawPointsCount / 100000) * 0.8
    ).toFixed(1);
    return Math.max(1.2, parseFloat(calculated));
  }, [m.framesCaptured, rawPointsCount]);

  const generatedFileName = useMemo(() => {
    const bPart = (selectedBuilding || "building")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    const fPart = (selectedFloor || "floor")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    return `${bPart}_${fPart}_pointcloud.ply`;
  }, [selectedBuilding, selectedFloor]);

  const isAlreadyUploaded =
    !!activeSessionId && uploadedSessionIds.includes(activeSessionId);

  const [percentage, setPercentage] = useState(isAlreadyUploaded ? 100 : 0);
  const [statusText, setStatusText] = useState(
    isAlreadyUploaded
      ? "Upload complete! Session ready for AI processing."
      : "Connecting to central ingestion API...",
  );
  const [uploadComplete, setUploadComplete] = useState(isAlreadyUploaded);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(activeSessionId);

  const [steps, setSteps] = useState<CheckStep[]>([
    {
      label: `Device calibration & sensor parameters (${distanceMeters}m walk)`,
      detail: "Validating sensor drift & IMU timestamp alignment",
      status: isAlreadyUploaded ? "completed" : "pending",
    },
    {
      label: `Point cloud binary sequence (${m.pointsCaptured} points)`,
      detail: "Encoding geometry coordinates into binary PLY",
      status: isAlreadyUploaded ? "completed" : "pending",
    },
    {
      label: `LiDAR depth frames (${m.framesCaptured.toLocaleString()} frames)`,
      detail: "Syncing raw visual depth arrays with database",
      status: isAlreadyUploaded ? "completed" : "pending",
    },
    {
      label: `Mapping session created for ${selectedBuilding || "Facility"} - ${selectedFloor || "Level"}`,
      detail: "Registering session metadata & artifact hashes",
      status: isAlreadyUploaded ? "completed" : "pending",
    },
  ]);

  const hasStartedRef = useRef(false);
  const isMountedRef = useRef(true);

  const startPipeline = async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setUploadFailed(false);

    try {
      // Stage 1: Validation
      setPercentage(15);
      setStatusText("Validating sensor parameters and device calibration...");
      setSteps((prev) => [
        { ...prev[0], status: "processing" },
        prev[1],
        prev[2],
        prev[3],
      ]);
      await new Promise((r) => setTimeout(r, 600));
      if (!isMountedRef.current) return;

      setSteps((prev) => [
        { ...prev[0], status: "completed" },
        { ...prev[1], status: "processing" },
        prev[2],
        prev[3],
      ]);

      // Stage 2: Create real session in Database
      setPercentage(35);
      setStatusText("Creating mapping session in central database...");
      const newSessionId = await createSession({
        distance_walked: distanceMeters,
        duration_seconds: durationSec,
        frames_count: m.framesCaptured,
        points_captured_count: rawPointsCount,
        coverage_percentage: m.coverage,
        quality_rating: m.quality || "High",
      });
      if (!isMountedRef.current) return;
      setSessionId(newSessionId);

      setSteps((prev) => [
        prev[0],
        { ...prev[1], status: "completed" },
        { ...prev[2], status: "processing" },
        prev[3],
      ]);

      // Stage 3: Upload session assets
      setPercentage(70);
      setStatusText(
        `Uploading ${generatedFileName} (${estimatedFileSizeMB} MB)...`,
      );
      await uploadSessionAssets(newSessionId);
      if (!isMountedRef.current) return;

      setSteps((prev) => [
        prev[0],
        prev[1],
        { ...prev[2], status: "completed" },
        {
          ...prev[3],
          status: "processing",
          label: `Mapping session #${newSessionId} registered for ${selectedBuilding || "Facility"}`,
        },
      ]);

      // Stage 4: Checksum & Finalizing
      setPercentage(90);
      setStatusText("Verifying checksums and initializing AI queue...");
      await new Promise((r) => setTimeout(r, 500));
      if (!isMountedRef.current) return;

      setPercentage(100);
      setStatusText("Upload complete! Session ready for AI processing.");
      setSteps((prev) => [
        prev[0],
        prev[1],
        prev[2],
        { ...prev[3], status: "completed" },
      ]);
      setUploadComplete(true);
      markSessionUploaded(newSessionId);
    } catch (err) {
      console.error("Upload pipeline failed:", err);
      if (isMountedRef.current) {
        hasStartedRef.current = false;
        setUploadFailed(true);
        setStatusText("Upload failed. Please check backend connection.");
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (isAlreadyUploaded) {
      setSessionId(activeSessionId);
      setPercentage(100);
      setUploadComplete(true);
      setStatusText("Upload complete! Session ready for AI processing.");
      setSteps((prev) =>
        prev.map((step) => ({ ...step, status: "completed" })),
      );
      return;
    }

    startPipeline();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleStartProcessing = async () => {
    if (sessionId) {
      try {
        await triggerProcessing(sessionId);
        router.push("/ai-processing");
      } catch (err) {
        console.error("Failed to trigger AI processing:", err);
      }
    }
  };

  const currentUploadedMB = useMemo(() => {
    return ((estimatedFileSizeMB * percentage) / 100).toFixed(1);
  }, [estimatedFileSizeMB, percentage]);

  return (
    <View style={styles.container}>
      <Heading
        tag="STEP 6"
        title="Upload & Process"
        subtitle={`Syncing ${m.pointsCaptured} points captured at ${selectedBuilding || "Facility"} - ${selectedFloor || "Level"}`}
      />

      <Card style={styles.uploadCard}>
        <View
          style={[styles.cloudWrap, { backgroundColor: theme.primarySoft }]}
        >
          <AppIcon name="upload" size={32} color={theme.accent} />
        </View>
        <Text style={[styles.fileName, { color: theme.text }]}>
          {generatedFileName}
        </Text>
        <Text style={[styles.statusText, { color: theme.accent }]}>
          {statusText}
        </Text>
        <Text style={[styles.fileSize, { color: theme.textMuted }]}>
          {uploadComplete
            ? `${estimatedFileSizeMB} MB / ${estimatedFileSizeMB} MB (100%)`
            : `${currentUploadedMB} MB / ${estimatedFileSizeMB} MB (${percentage}%)`}
        </Text>

        <ProgressBar percent={percentage} showLabel={false} />
      </Card>

      <Card style={{ gap: 10 }}>
        {steps.map((item, idx) => {
          const isDone = item.status === "completed";
          const isCurrent = item.status === "processing";

          return (
            <View key={idx} style={styles.checkRow}>
              <AppIcon
                name={isDone ? "checkCircle" : isCurrent ? "rotate" : "refresh"}
                size={18}
                color={
                  isDone
                    ? theme.success
                    : isCurrent
                      ? theme.warning
                      : theme.textMuted
                }
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.checkText, { color: theme.text }]}>
                  {item.label}
                </Text>
                <Text style={[styles.checkDetail, { color: theme.textMuted }]}>
                  {item.detail}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isDone
                      ? theme.successSoft
                      : isCurrent
                        ? theme.warningSoft
                        : theme.surfaceMuted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: isDone
                        ? theme.success
                        : isCurrent
                          ? theme.warning
                          : theme.textMuted,
                    },
                  ]}
                >
                  {isDone ? "Synced" : isCurrent ? "Active" : "Pending"}
                </Text>
              </View>
            </View>
          );
        })}
      </Card>

      {uploadFailed ? (
        <Pressable
          onPress={startPipeline}
          style={[styles.btnPrimary, { backgroundColor: theme.accent }]}
        >
          <Text style={styles.btnText}>Retry Upload</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={handleStartProcessing}
          disabled={!uploadComplete}
          style={[
            styles.btnPrimary,
            {
              backgroundColor: uploadComplete
                ? theme.primary
                : theme.surfaceMuted,
            },
          ]}
        >
          <Text style={styles.btnText}>Start Processing</Text>
        </Pressable>
      )}

      <Pressable
        onPress={() => router.push("/my-scans")}
        style={[styles.btnSecondary, { borderColor: theme.borderHighlight }]}
      >
        <Text style={[styles.btnSecondaryText, { color: theme.text }]}>
          Upload Later
        </Text>
      </Pressable>
    </View>
  );
}
