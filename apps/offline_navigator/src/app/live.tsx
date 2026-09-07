<<<<<<< HEAD
import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
=======
import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { usePDRSensors } from "@/hooks/usePDRSensors";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { Card } from "@/components/ui/card";
import { LiveMapCanvas } from "@/components/ui/live-map-canvas";
import { MapDirectionsView } from "@/components/ui/map-directions-view";

interface NavStep {
  instruction: string;
  detail: string;
  distance: string;
  icon: AppIconName;
  pct: number;
}

export default function Live() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
<<<<<<< HEAD
  const { destination } = useAppContext();

  const [currentStep, setCurrentStep] = useState(0);

  const navigationSteps = [
    {
      instruction: "Head straight down Main Corridor",
      distance: "In 30 m",
      icon: "route" as const,
      detail: "Pass Radiology reception on your left",
    },
    {
      instruction: "Take Elevator A to Floor 2",
      distance: "In 15 m",
      icon: "hospital" as const,
      detail: "Accessible elevator with voice announce",
    },
    {
      instruction: "Turn right into Clinical Wing",
      distance: "In 20 m",
      icon: "route" as const,
      detail: `${destination?.name || "Destination"} will be on your right`,
    },
  ];

  const step = navigationSteps[currentStep];

  const handleNextStep = () => {
    if (currentStep < navigationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
=======
  const { destination, currentFloorMap, hospital } = useAppContext();

  const [stepIndex, setStepIndex] = useState(0);
  const [mapMode, setMapMode] = useState<"indoor" | "gps">("indoor");

  // Real-time sensor fusion: accelerometer step detection + compass yaw
  const pdr = usePDRSensors(true);

  // Generate dynamic navigation waypoints based on real destination & floor metadata
  const navSteps = useMemo<NavStep[]>(() => {
    if (!destination) {
      return [
        {
          instruction: "Proceed towards destination entrance",
          detail: "Follow signage on your floor",
          distance: "40 m",
          icon: "route",
          pct: 50,
        },
        {
          instruction: "Arriving at destination",
          detail: "Destination entrance",
          distance: "0 m",
          icon: "location",
          pct: 100,
        },
      ];
    }

    const bName = destination.building_name || "Main Complex";
    const fName = destination.floor_name || "Ground Floor";
    const rNum = destination.room_number
      ? ` (Room #${destination.room_number})`
      : "";

    return [
      {
        instruction: `Depart from Entrance QR Anchor`,
        detail: `Head towards ${bName}`,
        distance: "30 m",
        icon: "route",
        pct: 15,
      },
      {
        instruction: `Follow ${fName} Main Corridor`,
        detail: `Continue straight along main hallway`,
        distance: "55 m",
        icon: "route",
        pct: 50,
      },
      {
        instruction: `Turn into ${destination.name}${rNum}`,
        detail: `Destination door is directly ahead`,
        distance: "15 m",
        icon: "navigation",
        pct: 85,
      },
      {
        instruction: `Arrived at ${destination.name}`,
        detail: `${fName} · ${bName}`,
        distance: "0 m",
        icon: "location",
        pct: 100,
      },
    ];
  }, [destination]);

  const currentStep = navSteps[stepIndex];
  const isFinalStep = stepIndex === navSteps.length - 1;
  const isFirstStep = stepIndex === 0;
  const progressPercent = currentStep?.pct ?? 0;

  const handleNextStep = () => {
    if (stepIndex < navSteps.length - 1) {
      setStepIndex((prev) => prev + 1);
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
    } else {
      router.push("/arrival");
    }
  };
<<<<<<< HEAD

  return (
    <View style={s.live}>
      <Card>
        <View style={s.turn}>
          <AppIcon name={step.icon} size={38} color={theme.primary} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>
              STEP {currentStep + 1} OF {navigationSteps.length}
            </Text>
            <Text style={s.title}>{step.instruction}</Text>
            <Text style={s.body}>{step.distance} · {step.detail}</Text>
          </View>
        </View>
      </Card>

      <View style={s.map}>
        <AppIcon name="location" size={70} color={theme.primary} />
        <Text style={{ color: theme.text, fontSize: 14, fontWeight: "700", marginTop: 8 }}>
          Heading towards {destination?.name || "Destination"}
        </Text>
        <View style={s.you}>
          <AppIcon name="navigation" color={theme.text} size={20} />
        </View>
      </View>

      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <View>
            <Text style={s.metric}>{currentStep === 2 ? "1 min remaining" : "3 min remaining"}</Text>
            <Text style={s.small}>{destination?.name || "Department"}</Text>
          </View>
          <Pressable
            onPress={handleNextStep}
            style={{ backgroundColor: theme.primarySoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
          >
            <Text style={{ color: theme.primary, fontWeight: "700", fontSize: 13 }}>
              {currentStep < navigationSteps.length - 1 ? "Next Step ›" : "Confirm Arrival ›"}
            </Text>
          </Pressable>
        </View>
        <AppButton label="End Navigation" variant="danger" onPress={() => router.push("/arrival")} />
      </Card>
=======

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  if (!destination) {
    return (
      <View style={localStyles.emptyContainer}>
        <Text style={[s.rowTitle, { color: theme.text }]}>
          No active navigation
        </Text>
        <AppButton
          label="Select Destination"
          onPress={() => router.push("/search")}
        />
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      {/* Top Turn Instruction Banner */}
      <BlurView
        intensity={50}
        tint={theme.glassTint}
        style={[
          localStyles.instructionCard,
          { borderColor: theme.borderHighlight },
        ]}
      >
        <View style={localStyles.turnRow}>
          <View
            style={[
              localStyles.turnIconWrap,
              {
                backgroundColor: isFinalStep
                  ? "rgba(16, 185, 129, 0.2)"
                  : theme.primarySoft,
              },
            ]}
          >
            <AppIcon
              name={currentStep.icon}
              size={32}
              color={isFinalStep ? theme.success : theme.primary}
            />
          </View>
          <View style={s.flex}>
            <View style={localStyles.badgeRow}>
              <Text style={[localStyles.stepTag, { color: theme.primary }]}>
                WAYPOINT {stepIndex + 1} OF {navSteps.length}
              </Text>
              <Text
                style={[localStyles.distanceBadge, { color: theme.textMuted }]}
              >
                {currentStep.distance}
              </Text>
            </View>
            <Text style={[localStyles.turnTitle, { color: theme.text }]}>
              {currentStep.instruction}
            </Text>
            <Text style={[localStyles.turnDetail, { color: theme.textMuted }]}>
              {currentStep.detail}
            </Text>
          </View>
        </View>
      </BlurView>

      {/* Mode Switcher */}
      <View style={localStyles.toggleRow}>
        <Pressable
          onPress={() => setMapMode("indoor")}
          style={[
            localStyles.toggleBtn,
            mapMode === "indoor"
              ? { backgroundColor: theme.primary, borderColor: theme.primary }
              : { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <AppIcon
            name="route"
            size={13}
            color={mapMode === "indoor" ? "#ffffff" : theme.textMuted}
          />
          <Text
            style={[
              localStyles.toggleText,
              { color: mapMode === "indoor" ? "#ffffff" : theme.textMuted },
            ]}
          >
            Indoor Floor Map
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMapMode("gps")}
          style={[
            localStyles.toggleBtn,
            mapMode === "gps"
              ? { backgroundColor: theme.primary, borderColor: theme.primary }
              : { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <AppIcon
            name="location"
            size={13}
            color={mapMode === "gps" ? "#ffffff" : theme.textMuted}
          />
          <Text
            style={[
              localStyles.toggleText,
              { color: mapMode === "gps" ? "#ffffff" : theme.textMuted },
            ]}
          >
            React Native Map Directions
          </Text>
        </Pressable>
      </View>

      {/* Interactive Map View with PDR Sensor Orientation & Step Telemetry */}
      <View style={localStyles.mapWrap}>
        {mapMode === "indoor" ? (
          <>
            <LiveMapCanvas
              floorMap={currentFloorMap}
              destination={destination}
              progressPercent={progressPercent}
              headingDegrees={pdr.headingDegrees}
              isMoving={pdr.isMoving}
              stepsCount={pdr.stepsCount}
              distanceWalked={pdr.distanceWalkedMeters}
              height={270}
            />
            {/* Floor Level Floating Tag */}
            <View style={localStyles.floorTag}>
              <Text style={localStyles.floorTagText}>
                {destination.floor_name
                  ? destination.floor_name.toUpperCase()
                  : "FLOOR 1"}
              </Text>
            </View>
          </>
        ) : (
          <MapDirectionsView
            hospital={hospital}
            destination={destination}
            height={270}
          />
        )}
      </View>

      {/* Manual Step Navigation Controls */}
      <View style={localStyles.stepNavRow}>
        <Pressable
          onPress={handlePrevStep}
          disabled={isFirstStep}
          style={[
            localStyles.stepCtrlBtn,
            {
              backgroundColor: isFirstStep
                ? "rgba(30, 41, 59, 0.4)"
                : theme.surface,
              borderColor: isFirstStep
                ? "rgba(255, 255, 255, 0.05)"
                : theme.border,
            },
          ]}
        >
          <AppIcon
            name="arrow-left"
            size={16}
            color={isFirstStep ? theme.textMuted : theme.text}
          />
          <Text
            style={[
              localStyles.stepCtrlText,
              { color: isFirstStep ? theme.textMuted : theme.text },
            ]}
          >
            Previous Step
          </Text>
        </Pressable>

        <Pressable
          onPress={handleNextStep}
          style={[
            localStyles.stepCtrlBtn,
            {
              backgroundColor: isFinalStep ? theme.success : theme.primary,
              borderColor: isFinalStep ? theme.success : theme.primary,
            },
          ]}
        >
          <Text
            style={[
              localStyles.stepCtrlText,
              { color: "#ffffff", fontWeight: "800" },
            ]}
          >
            {isFinalStep ? "I Have Arrived ✓" : "Next Step →"}
          </Text>
        </Pressable>
      </View>

      {/* Navigation Metrics with Live PDR Walking Telemetry */}
      <BlurView
        intensity={40}
        tint={theme.glassTint}
        style={[
          localStyles.metricsCard,
          { borderColor: theme.borderHighlight },
        ]}
      >
        <View style={localStyles.destHeader}>
          <View style={s.flex}>
            <Text style={[localStyles.destTitle, { color: theme.text }]}>
              {destination.name}
            </Text>
            <Text style={[localStyles.destDetail, { color: theme.textMuted }]}>
              {destination.detail}{" "}
              {destination.room_number
                ? `· Room #${destination.room_number}`
                : ""}
            </Text>
          </View>
          <View style={localStyles.etaBox}>
            <Text style={[localStyles.etaText, { color: theme.primary }]}>
              {pdr.stepsCount > 0
                ? `${pdr.distanceWalkedMeters} m`
                : currentStep.distance}
            </Text>
            <Text style={[localStyles.etaSub, { color: theme.textMuted }]}>
              {pdr.stepsCount > 0
                ? `${pdr.stepsCount} steps walked`
                : isFinalStep
                ? "Arrived"
                : "Next waypoint"}
            </Text>
          </View>
        </View>

        <AppButton
          label="Cancel Navigation"
          variant="danger"
          onPress={() => router.push("/dashboard")}
        />
      </BlurView>
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    gap: 12,
  },
  emptyContainer: {
    gap: 16,
    padding: 20,
    alignItems: "center",
  },
  instructionCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  turnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  turnIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  stepTag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  distanceBadge: {
    fontSize: 11,
    fontWeight: "700",
  },
  turnTitle: {
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 20,
  },
  turnDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  mapWrap: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  floorTag: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(10, 15, 29, 0.85)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  floorTagText: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  stepNavRow: {
    flexDirection: "row",
    gap: 10,
  },
  stepCtrlBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  stepCtrlText: {
    fontSize: 13,
    fontWeight: "700",
  },
  metricsCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    overflow: "hidden",
  },
  destHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  destTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  destDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  etaBox: {
    alignItems: "flex-end",
  },
  etaText: {
    fontSize: 16,
    fontWeight: "800",
  },
  etaSub: {
    fontSize: 10,
    fontWeight: "600",
  },
});
