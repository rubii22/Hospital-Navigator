import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { AppIcon } from "./app-icon";
import type { VectorMapData, Destination } from "@/api/navigator-api";

interface LiveMapCanvasProps {
  floorMap: VectorMapData | null;
  destination: Destination | null;
  progressPercent: number; // 0 to 100
  headingDegrees?: number; // Compass yaw 0 to 360
  isMoving?: boolean;
  stepsCount?: number;
  distanceWalked?: number;
  height?: number;
}

export function LiveMapCanvas({
  floorMap,
  destination,
  progressPercent,
  headingDegrees = 0,
  isMoving = false,
  stepsCount = 0,
  distanceWalked = 0,
  height = 280,
}: LiveMapCanvasProps) {
  const theme = useTheme();

  const destName = destination?.name || "Destination";
  const destRoomNumber = destination?.room_number || "";
  const floorName =
    destination?.floor_name || floorMap?.floor_name || "Ground Floor";

  // Check if we have rooms in the loaded vector map
  const hasDynamicRooms = Boolean(floorMap?.rooms && floorMap.rooms.length > 0);

  // Dynamic bounds normalization
  const rooms = hasDynamicRooms
    ? floorMap!.rooms.map((r, idx) => {
        const isTarget =
          (destination?.name &&
            r.name.toLowerCase().includes(destination.name.toLowerCase())) ||
          (destination?.room_number &&
            r.room_number === destination.room_number) ||
          (destination?.raw_id && r.room_id === destination.raw_id);

        // Normalize coordinates into percentage ranges (10% to 85% X, 15% to 75% Y)
        const leftPct = Math.min(Math.max((r.x / 65) * 100, 8), 75);
        const topPct = Math.min(Math.max((r.y / 45) * 100, 12), 70);
        const widthPct = Math.min(Math.max((r.width / 65) * 100, 22), 35);
        const heightPct = Math.min(Math.max((r.height / 45) * 100, 18), 28);

        return {
          id: r.id || `rm_${idx}`,
          name: r.name,
          room_number: r.room_number,
          type: r.type || "general",
          leftPct,
          topPct,
          widthPct,
          heightPct,
          isTarget,
        };
      })
    : [];

  // Calculate user dot position along the navigation corridor path
  let userPosX = 15;
  let userPosY = 75;

  if (progressPercent <= 50) {
    userPosX = 15 + (progressPercent / 50) * 58;
    userPosY = 75;
  } else {
    userPosX = 73;
    userPosY = 75 - ((progressPercent - 50) / 50) * 52;
  }

  return (
    <View
      style={[styles.canvas, { height, borderColor: theme.borderHighlight }]}
    >
      {/* Background Architectural Grid */}
      <View style={styles.gridOverlay}>
        <View style={styles.gridHLine1} />
        <View style={styles.gridHLine2} />
        <View style={styles.gridVLine1} />
        <View style={styles.gridVLine2} />
      </View>

      {/* Main Floor Corridors */}
      <View style={styles.corridorH} />
      <View style={styles.corridorV} />

      {/* Entrance Anchor */}
      <View style={[styles.roomBox, styles.roomEntrance]}>
        <AppIcon name="qr" size={13} color="#38bdf8" />
        <Text style={styles.roomLabel}>Entrance</Text>
      </View>

      {/* Elevator Lobby */}
      <View style={[styles.roomBox, styles.roomElevator]}>
        <AppIcon name="navigation" size={12} color="#a855f7" />
        <Text style={styles.roomSmallLabel}>Elevator</Text>
      </View>

      {/* Dynamic Vector Map Rooms */}
      {hasDynamicRooms ? (
        rooms.map((rm) => (
          <View
            key={rm.id}
            style={[
              styles.roomBox,
              {
                left: `${rm.leftPct}%`,
                top: `${rm.topPct}%`,
                width: `${rm.widthPct}%`,
                height: `${rm.heightPct}%`,
                borderColor: rm.isTarget
                  ? theme.success
                  : "rgba(99, 102, 241, 0.35)",
                backgroundColor: rm.isTarget
                  ? "rgba(16, 185, 129, 0.16)"
                  : "rgba(30, 41, 59, 0.65)",
                zIndex: rm.isTarget ? 5 : 1,
              },
            ]}
          >
            {rm.isTarget ? (
              <View style={styles.targetHeader}>
                <AppIcon name="location" size={14} color={theme.success} />
                <Text
                  numberOfLines={1}
                  style={[styles.roomTargetLabel, { color: theme.success }]}
                >
                  {rm.name}
                </Text>
              </View>
            ) : (
              <Text numberOfLines={1} style={styles.roomLabel}>
                {rm.name}
              </Text>
            )}

            {rm.room_number ? (
              <Text
                style={
                  rm.isTarget
                    ? styles.roomNumberBadgeTarget
                    : styles.roomNumberBadge
                }
              >
                #{rm.room_number}
              </Text>
            ) : null}
          </View>
        ))
      ) : (
        /* Fallback Static Target Room if vector map data is loading */
        <View
          style={[
            styles.roomBox,
            styles.roomTarget,
            {
              borderColor: theme.success,
              backgroundColor: "rgba(16, 185, 129, 0.15)",
            },
          ]}
        >
          <View style={styles.targetHeader}>
            <AppIcon name="location" size={15} color={theme.success} />
            <Text
              numberOfLines={1}
              style={[styles.roomTargetLabel, { color: theme.success }]}
            >
              {destName}
            </Text>
          </View>
          {destRoomNumber ? (
            <Text style={styles.roomNumberBadgeTarget}>
              Room #{destRoomNumber}
            </Text>
          ) : (
            <Text style={styles.roomNumberBadgeTarget}>{floorName}</Text>
          )}
        </View>
      )}

      {/* Navigation Route Trail */}
      <View style={styles.routeTrailH} />
      {progressPercent > 50 && <View style={styles.routeTrailV} />}

      {/* Live User Position Indicator with PDR Compass Orientation Cone */}
      <View
        style={[
          styles.userIndicator,
          {
            left: `${userPosX}%`,
            top: `${userPosY}%`,
          },
        ]}
      >
        <View style={styles.userPulse} />
        {/* Dynamic Compass Heading Cone */}
        <View
          style={[
            styles.headingCone,
            {
              transform: [{ rotate: `${headingDegrees}deg` }],
            },
          ]}
        >
          <View style={styles.headingArrow} />
        </View>
        <View style={[styles.userDot, { backgroundColor: "#38bdf8" }]} />
      </View>

      {/* Sensor PDR Badge */}
      <View style={styles.pdrBadge}>
        <View
          style={[
            styles.pdrDot,
            { backgroundColor: isMoving ? "#10b981" : "#38bdf8" },
          ]}
        />
        <Text style={styles.pdrText}>
          {stepsCount > 0
            ? `${stepsCount} steps · ${distanceWalked}m`
            : `${headingDegrees}° N · PDR ACTIVE`}
        </Text>
      </View>

      {/* Map Watermark & Scale Badge */}
      <View style={styles.watermark}>
        <Text style={styles.watermarkText}>
          INDOOR 2D VECTOR MAP · {floorName.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "#070d19",
    position: "relative",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
  },
  gridHLine1: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "33%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  gridHLine2: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "66%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  gridVLine1: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "33%",
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  gridVLine2: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "66%",
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  corridorH: {
    position: "absolute",
    left: "10%",
    right: "18%",
    top: "72%",
    height: 22,
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.15)",
  },
  corridorV: {
    position: "absolute",
    left: "70%",
    width: 22,
    top: "16%",
    bottom: "18%",
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.15)",
  },
  roomBox: {
    position: "absolute",
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  roomEntrance: {
    left: "4%",
    top: "66%",
    width: 66,
    height: 42,
    borderColor: "rgba(56, 189, 248, 0.4)",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    flexDirection: "row",
    gap: 4,
    zIndex: 2,
  },
  roomElevator: {
    right: "6%",
    top: "74%",
    width: 62,
    height: 38,
    borderColor: "rgba(168, 85, 247, 0.4)",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    flexDirection: "row",
    gap: 4,
    zIndex: 2,
  },
  roomTarget: {
    right: "6%",
    top: "14%",
    width: 140,
    height: 56,
    zIndex: 5,
  },
  targetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  roomLabel: {
    color: "#94a3b8",
    fontSize: 9.5,
    fontWeight: "700",
    textAlign: "center",
  },
  roomSmallLabel: {
    color: "#c084fc",
    fontSize: 8.5,
    fontWeight: "700",
  },
  roomTargetLabel: {
    fontSize: 10.5,
    fontWeight: "800",
  },
  roomNumberBadge: {
    color: "#64748b",
    fontSize: 8.5,
    fontWeight: "700",
    marginTop: 2,
  },
  roomNumberBadgeTarget: {
    color: "#34d399",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },
  routeTrailH: {
    position: "absolute",
    left: "15%",
    width: "58%",
    top: "75%",
    height: 3,
    backgroundColor: "#38bdf8",
    borderRadius: 2,
  },
  routeTrailV: {
    position: "absolute",
    left: "73%",
    width: 3,
    top: "22%",
    height: "53%",
    backgroundColor: "#38bdf8",
    borderRadius: 2,
  },
  userIndicator: {
    position: "absolute",
    width: 32,
    height: 32,
    marginLeft: -16,
    marginTop: -16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  userPulse: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(56, 189, 248, 0.3)",
  },
  headingCone: {
    position: "absolute",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headingArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#38bdf8",
    transform: [{ rotate: "0deg" }],
  },
  userDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  pdrBadge: {
    position: "absolute",
    top: 8,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(10, 15, 29, 0.85)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 15,
  },
  pdrDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pdrText: {
    color: "#38bdf8",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  watermark: {
    position: "absolute",
    bottom: 8,
    right: 12,
  },
  watermarkText: {
    color: "rgba(255, 255, 255, 0.22)",
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
