import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { AppIcon } from "@/components/ui/app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";
import { Loader } from "@/components/ui/plus-loader";

export default function ScanningLiveScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    selectedBuilding,
    selectedFloor,
    setSummaryMetrics,
    setCapturedFrameBase64,
    addCapturedFrame,
    clearCapturedFrames,
  } = useExtractorContext();

  const cameraRef = React.useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isGridOn, setIsGridOn] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Live scanning states
  const [coverage, setCoverage] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [frames, setFrames] = useState(0);
  const [points, setPoints] = useState(0);

  // Reset captured frames on entering scan session
  useEffect(() => {
    clearCapturedFrames();
  }, []);

  // Trigger permission request on mount if needed
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Periodic keyframe capture loop (every 3.5 seconds)
  useEffect(() => {
    if (isPaused) return;

    const captureInterval = setInterval(async () => {
      try {
        if (cameraRef.current) {
          const snap = await cameraRef.current.takePictureAsync({
            base64: true,
            quality: 0.75,
          });
          if (snap?.base64) {
            addCapturedFrame(snap.base64);
          }
        }
      } catch (err) {
        // Continuous scan capture note
      }
    }, 3500);

    return () => clearInterval(captureInterval);
  }, [isPaused]);

  // Live statistics simulation loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
      setFrames((prev) => prev + 24 + Math.floor(Math.random() * 8));
      setPoints((prev) => prev + 120 + Math.floor(Math.random() * 60));
      setCoverage((prev) => {
        if (prev >= 100) return 100;
        const incr = 1 + Math.random() * 2;
        return Math.min(100, Number((prev + incr).toFixed(1)));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatPoints = (pts: number) => {
    if (pts >= 1000000) {
      return `${(pts / 1000000).toFixed(1)}M`;
    }
    return `${(pts / 1000).toFixed(0)}K`;
  };

  const handleStopScan = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.85,
        });
        if (photo?.base64) {
          addCapturedFrame(photo.base64);
          setCapturedFrameBase64(photo.base64);
        }
      }
    } catch (e) {
      console.warn("Snapshot capture note:", e);
    }

    const rating =
      coverage >= 90
        ? "Excellent"
        : coverage >= 75
          ? "High"
          : coverage >= 50
            ? "Medium"
            : "Low";
    const quality = coverage >= 80 ? "High" : "Medium";

    setSummaryMetrics({
      coverage: Math.round(coverage),
      rating,
      distanceWalked: `${Math.round(seconds * 0.8)} m`,
      framesCaptured: frames,
      pointsCaptured: formatPoints(points),
      duration: formatDuration(seconds),
      areasCovered: coverage >= 90 ? "All Good" : "Incomplete",
      quality,
    });
    router.push("/scan-summary");
  };

  // Rendering loading state for camera permission check
  if (!permission) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <Loader size={64} label="Initializing camera module..." />
      </View>
    );
  }

  // Camera permissions not granted
  if (!permission.granted) {
    return (
      <View
        style={[
          styles.permissionContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <View
          style={[styles.lockIconWrap, { backgroundColor: theme.primarySoft }]}
        >
          <AppIcon name="emergency" size={32} color={theme.accent} />
        </View>
        <Text style={[styles.permissionText, { color: theme.text }]}>
          Camera permission is required to scan hospital hallways and extract
          layout geometry.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.btnText}>Grant Camera Permission</Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.btnSecondary,
            { borderColor: theme.borderHighlight, marginTop: 12 },
          ]}
        >
          <Text style={[styles.btnSecondaryText, { color: theme.text }]}>
            Cancel
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View
        style={[
          styles.topHeader,
          { backgroundColor: "rgba(10, 15, 29, 0.85)" },
        ]}
      >
        <Text style={[styles.statusTitle, { color: theme.text }]}>
          {isPaused ? "Scanning Paused" : "Scanning in Progress"}
        </Text>
        <Text style={[styles.statusSub, { color: theme.accent }]}>
          {selectedBuilding} - {selectedFloor}
        </Text>
      </View>

      {/* Camera Viewfinder */}
      <View style={[styles.viewfinder, { borderColor: theme.borderHighlight }]}>
        {/* Active Native Camera View */}
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={isFlashOn}
        />

        {/* AR Grid Overlay */}
        {isGridOn && (
          <View style={styles.gridContainer}>
            {Array.from({ length: 9 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.gridCell,
                  { borderColor: "rgba(99, 102, 241, 0.25)" },
                ]}
              />
            ))}
          </View>
        )}

        {/* Live Top Stats */}
        <View style={styles.hudTop}>
          <View style={styles.hudBadge}>
            <Text style={styles.hudLabel}>FPS</Text>
            <Text style={styles.hudVal}>{isPaused ? 0 : 30}</Text>
          </View>
          <View style={styles.hudBadge}>
            <Text style={styles.hudLabel}>Points</Text>
            <Text style={styles.hudVal}>{formatPoints(points)}</Text>
          </View>
        </View>

        {/* Action Controls Sidebar */}
        <View style={styles.sidebarControls}>
          <Pressable
            onPress={() => setIsFlashOn(!isFlashOn)}
            style={[
              styles.sideBtn,
              isFlashOn
                ? { backgroundColor: theme.primary }
                : { backgroundColor: "rgba(255, 255, 255, 0.18)" },
            ]}
          >
            <AppIcon name="flash" size={18} color="#ffffff" />
            <Text style={styles.sideBtnText}>Flash</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsGridOn(!isGridOn)}
            style={[
              styles.sideBtn,
              isGridOn
                ? { backgroundColor: theme.primary }
                : { backgroundColor: "rgba(255, 255, 255, 0.18)" },
            ]}
          >
            <AppIcon name="grid" size={18} color="#ffffff" />
            <Text style={styles.sideBtnText}>AR Grid</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsPaused(!isPaused)}
            style={[
              styles.sideBtn,
              isPaused
                ? { backgroundColor: theme.warning }
                : { backgroundColor: "rgba(255, 255, 255, 0.18)" },
            ]}
          >
            <AppIcon
              name={isPaused ? "play" : "pause"}
              size={18}
              color="#ffffff"
            />
            <Text style={styles.sideBtnText}>
              {isPaused ? "Resume" : "Pause"}
            </Text>
          </Pressable>
        </View>

        {/* Stop/Finish Button */}
        <View style={styles.bottomStopWrap}>
          <Pressable
            onPress={handleStopScan}
            style={[styles.stopBtn, { backgroundColor: theme.danger }]}
          >
            <View style={styles.stopInner} />
          </Pressable>
        </View>
      </View>

      {/* Live Bottom Stats Bar */}
      <View
        style={[
          styles.bottomStatsCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.borderHighlight,
          },
        ]}
      >
        <View style={styles.statCol}>
          <Text style={[styles.statTitle, { color: theme.textMuted }]}>
            Coverage
          </Text>
          <Text style={[styles.statVal, { color: theme.accent }]}>
            {Math.round(coverage)}%
          </Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statTitle, { color: theme.textMuted }]}>
            Duration
          </Text>
          <Text style={[styles.statVal, { color: theme.text }]}>
            {formatDuration(seconds)}
          </Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statTitle, { color: theme.textMuted }]}>
            Frames
          </Text>
          <Text style={[styles.statVal, { color: theme.text }]}>{frames}</Text>
        </View>
      </View>

      <Text style={[styles.footerNotice, { color: theme.textMuted }]}>
        {isPaused
          ? "Scan is paused. Tap resume to continue."
          : "Walk forward slowly to continue capturing hallway layout"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  topHeader: { alignItems: "center", paddingVertical: 8, borderRadius: 12 },
  statusTitle: { fontSize: 16, fontWeight: "800" },
  statusSub: { fontSize: 12, fontWeight: "700" },
  viewfinder: {
    height: 340,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    justifyContent: "space-between",
    padding: 14,
  },
  gridContainer: {
    ...StyleSheet.absoluteFill,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridCell: { width: "33.33%", height: "33.33%", borderWidth: 0.5 },
  hudTop: { flexDirection: "row", justifyContent: "space-between", zIndex: 10 },
  hudBadge: {
    backgroundColor: "rgba(10, 15, 29, 0.75)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  hudLabel: { color: "#94a3b8", fontSize: 9, fontWeight: "700" },
  hudVal: { color: "#ffffff", fontSize: 13, fontWeight: "800" },
  sidebarControls: {
    position: "absolute",
    right: 14,
    top: 60,
    gap: 10,
    zIndex: 10,
  },
  sideBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  sideBtnText: { color: "#ffffff", fontSize: 9, fontWeight: "700" },
  bottomStopWrap: { alignItems: "center", marginBottom: 8, zIndex: 10 },
  stopBtn: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  stopInner: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  bottomStatsCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  statCol: { alignItems: "center" },
  statTitle: { fontSize: 11, fontWeight: "600" },
  statVal: { fontSize: 18, fontWeight: "800", marginTop: 2 },
  footerNotice: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  lockIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  btnPrimary: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    width: "100%",
  },
  btnText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
  btnSecondary: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  btnSecondaryText: { fontSize: 14, fontWeight: "700" },
});
