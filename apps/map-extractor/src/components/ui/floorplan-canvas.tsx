import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useExtractorContext } from "@/context/ExtractorContext";
import { AppIcon } from "./app-icon";

interface FloorplanCanvasProps {
  showOverlay?: boolean;
  height?: number;
  editable?: boolean;
  activeTool?: string;
  rotation?: number;
  selectedElement?: { type: "room" | "door" | "node"; id: string } | null;
  customRooms?: any[];
  customDoors?: any[];
  customNodes?: any[];
  onCanvasPress?: (coords: { x: number; y: number }) => void;
  onDeleteElement?: (type: "room" | "door" | "node", id: string) => void;
  onSelectElement?: (element: any) => void;
}

export function FloorplanCanvas({
  showOverlay = true,
  height = 280,
  editable = false,
  activeTool = "Select",
  rotation = 0,
  selectedElement,
  customRooms,
  customDoors,
  customNodes,
  onCanvasPress,
  onDeleteElement,
  onSelectElement,
}: FloorplanCanvasProps) {
  const theme = useTheme();
  const {
    activeSessionId,
    apiMapData,
    apiDetections,
    apiOcrItems,
    fetchSessionArtifacts,
  } = useExtractorContext();

  useEffect(() => {
    if (activeSessionId && (!apiMapData || apiDetections.length === 0)) {
      fetchSessionArtifacts(activeSessionId);
    }
  }, [activeSessionId, apiMapData, apiDetections.length]);

  // Dynamic rooms from vector map or custom overrides
  const rooms = useMemo(() => {
    if (customRooms) return customRooms;
    if (apiMapData && apiMapData.rooms && apiMapData.rooms.length > 0) {
      return apiMapData.rooms;
    }
    return [];
  }, [customRooms, apiMapData]);

  // Dynamic doors
  const doors = useMemo(() => {
    if (customDoors) return customDoors;
    if (apiMapData && apiMapData.doors) {
      return apiMapData.doors;
    }
    return [];
  }, [customDoors, apiMapData]);

  // Dynamic nodes
  const nodes = useMemo(() => {
    if (customNodes) return customNodes;
    if (apiMapData && apiMapData.nodes) {
      return apiMapData.nodes;
    }
    return [];
  }, [customNodes, apiMapData]);

  // Color mapping based on detection class
  const getDetectionColor = (className: string) => {
    switch (className.toLowerCase()) {
      case "door":
        return "#10b981"; // green
      case "desk":
      case "table":
        return "#38bdf8"; // blue
      case "sign":
        return "#ef4444"; // red
      case "obstacle":
        return "#f59e0b"; // amber
      default:
        return "#6366f1"; // indigo
    }
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (!editable || !onCanvasPress) return;
    const { locationX, locationY } = e.nativeEvent;
    onCanvasPress({ x: Math.round(locationX), y: Math.round(locationY) });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.canvas,
        {
          height,
          backgroundColor: theme.surfaceMuted,
          borderColor: editable ? theme.accent : theme.borderHighlight,
          transform: [{ rotate: `${rotation}deg` }],
        },
      ]}
    >
      {/* Grid Canvas Background Pattern */}
      <View style={styles.gridPattern}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={`h_${i}`}
            style={[
              styles.gridLineH,
              {
                top: (i + 1) * (height / 7),
                borderColor: "rgba(255,255,255,0.03)",
              },
            ]}
          />
        ))}
      </View>

      {/* Dynamic 2D Room Boundaries */}
      {rooms.map((room, idx) => {
        const top = Number(room.y) || (idx === 0 ? 24 : 24 + idx * 45);
        const left = Number(room.x) || (idx === 0 ? 20 : 20 + (idx % 2) * 120);
        const width = Number(room.width) || (rooms.length === 1 ? 220 : 110);
        const boxHeight =
          Number(room.height) || (rooms.length === 1 ? 160 : 85);
        const roomId = String(room.id || `r_${idx}`);
        const isSelected =
          selectedElement?.type === "room" && selectedElement.id === roomId;

        return (
          <Pressable
            key={roomId}
            onPress={(e) => {
              if (activeTool === "Delete" && onDeleteElement) {
                e.stopPropagation?.();
                onDeleteElement("room", roomId);
              } else if (activeTool === "Select") {
                e.stopPropagation?.();
                if (onSelectElement)
                  onSelectElement({
                    type: "room",
                    data: { ...room, id: roomId },
                  });
              } else if (
                (activeTool === "Add Room" ||
                  activeTool === "Add Door" ||
                  activeTool === "Add Node") &&
                onCanvasPress
              ) {
                const roomX = Number(room.x) || 20;
                const roomY = Number(room.y) || 24;
                const locX = e.nativeEvent?.locationX || 0;
                const locY = e.nativeEvent?.locationY || 0;
                onCanvasPress({
                  x: Math.round(roomX + locX),
                  y: Math.round(roomY + locY),
                });
              }
            }}
            style={[
              styles.roomBox,
              {
                top: Math.max(10, Math.min(height - 80, top)),
                left: Math.max(10, Math.min(240, left)),
                width: Math.max(60, width),
                height: Math.max(50, boxHeight),
                borderColor: isSelected
                  ? theme.warning
                  : idx === 0
                    ? theme.primary
                    : theme.accent,
                backgroundColor: isSelected
                  ? "rgba(245, 158, 11, 0.12)"
                  : "rgba(255, 255, 255, 0.04)",
              },
            ]}
          >
            <View style={styles.roomHeader}>
              <AppIcon
                name="room"
                size={13}
                color={isSelected ? theme.warning : theme.accent}
              />
              <Text
                style={[
                  styles.roomLabel,
                  { color: isSelected ? theme.warning : theme.text },
                ]}
                numberOfLines={1}
              >
                {room.name || `Room ${idx + 1}`}
              </Text>
            </View>
            {activeTool === "Delete" && (
              <View style={styles.deleteBadge}>
                <AppIcon name="trash" size={10} color="#ffffff" />
              </View>
            )}
          </Pressable>
        );
      })}

      {/* Dynamic Doors */}
      {doors.map((door, idx) => {
        const left = Math.max(
          15,
          Math.min(260, Number(door.x) || 35 + idx * 40),
        );
        const top = Math.max(15, Math.min(height - 40, Number(door.y) || 20));
        const doorId = String(door.id || `d_${idx}`);
        const isSelected =
          selectedElement?.type === "door" && selectedElement.id === doorId;

        return (
          <Pressable
            key={doorId}
            onPress={(e) => {
              if (activeTool === "Delete" && onDeleteElement) {
                e.stopPropagation?.();
                onDeleteElement("door", doorId);
              } else if (activeTool === "Select") {
                e.stopPropagation?.();
                if (onSelectElement)
                  onSelectElement({
                    type: "door",
                    data: { ...door, id: doorId },
                  });
              } else if (
                (activeTool === "Add Room" ||
                  activeTool === "Add Door" ||
                  activeTool === "Add Node") &&
                onCanvasPress
              ) {
                const locX = e.nativeEvent?.locationX || 0;
                const locY = e.nativeEvent?.locationY || 0;
                onCanvasPress({
                  x: Math.round(left + locX),
                  y: Math.round(top + locY),
                });
              }
            }}
            style={[
              styles.doorIndicator,
              {
                left,
                top,
                borderColor: isSelected ? theme.warning : "#10b981",
                backgroundColor: isSelected
                  ? "rgba(245, 158, 11, 0.25)"
                  : "rgba(16, 185, 129, 0.2)",
              },
            ]}
          >
            <Text
              style={[
                styles.doorText,
                { color: isSelected ? theme.warning : "#10b981" },
              ]}
            >
              🚪 {door.name || `Door ${idx + 1}`}
            </Text>
            {activeTool === "Delete" && (
              <View style={[styles.deleteBadge, { marginLeft: 4 }]}>
                <AppIcon name="trash" size={8} color="#ffffff" />
              </View>
            )}
          </Pressable>
        );
      })}

      {/* Dynamic Navigation Nodes / POIs */}
      {nodes.map((node, idx) => {
        const left = Math.max(
          15,
          Math.min(260, Number(node.x) || 50 + idx * 35),
        );
        const top = Math.max(
          15,
          Math.min(height - 40, Number(node.y) || 60 + idx * 30),
        );
        const nodeId = String(node.id || `n_${idx}`);
        const isSelected =
          selectedElement?.type === "node" && selectedElement.id === nodeId;

        return (
          <Pressable
            key={nodeId}
            onPress={(e) => {
              if (activeTool === "Delete" && onDeleteElement) {
                e.stopPropagation?.();
                onDeleteElement("node", nodeId);
              } else if (activeTool === "Select") {
                e.stopPropagation?.();
                if (onSelectElement)
                  onSelectElement({
                    type: "node",
                    data: { ...node, id: nodeId },
                  });
              } else if (
                (activeTool === "Add Room" ||
                  activeTool === "Add Door" ||
                  activeTool === "Add Node") &&
                onCanvasPress
              ) {
                const locX = e.nativeEvent?.locationX || 0;
                const locY = e.nativeEvent?.locationY || 0;
                onCanvasPress({
                  x: Math.round(left + locX),
                  y: Math.round(top + locY),
                });
              }
            }}
            style={[
              styles.nodePin,
              {
                left,
                top,
                borderColor: isSelected ? theme.accent : theme.warning,
                backgroundColor: isSelected
                  ? "rgba(99, 102, 241, 0.25)"
                  : "rgba(245, 158, 11, 0.2)",
              },
            ]}
          >
            <AppIcon
              name="location"
              size={10}
              color={isSelected ? theme.accent : theme.warning}
            />
            <Text
              style={[
                styles.nodeText,
                { color: isSelected ? theme.accent : theme.warning },
              ]}
            >
              {node.label || `Node ${idx + 1}`}
            </Text>
            {activeTool === "Delete" && (
              <View style={[styles.deleteBadge, { marginLeft: 4 }]}>
                <AppIcon name="trash" size={8} color="#ffffff" />
              </View>
            )}
          </Pressable>
        );
      })}

      {/* Dynamic AI Computer Vision Detections Overlay */}
      {showOverlay &&
        apiDetections &&
        apiDetections.map((d, idx) => {
          const color = getDetectionColor(d.class_name);
          const left = Math.max(
            15,
            Math.min(230, (d.centroid_x + 3.0) * 35 + 20 + (idx % 2) * 20),
          );
          const top = Math.max(
            35,
            Math.min(height - 45, (-d.centroid_y + 3.0) * 30 + 15 + idx * 25),
          );

          return (
            <View
              key={d.id || idx}
              style={[
                styles.detectionPin,
                {
                  left,
                  top,
                  borderColor: color,
                  backgroundColor: "rgba(10, 15, 29, 0.9)",
                },
              ]}
            >
              <View style={[styles.pinDot, { backgroundColor: color }]} />
              <Text style={[styles.pinText, { color: theme.text }]}>
                {d.class_name.toUpperCase()} (
                {Math.round((d.confidence || 0.85) * 100)}%)
              </Text>
            </View>
          );
        })}

      {/* Dynamic OCR Detections Overlay */}
      {showOverlay &&
        apiOcrItems &&
        apiOcrItems.slice(0, 3).map((ocr, idx) => (
          <View
            key={`ocr_${ocr.id || idx}`}
            style={[
              styles.ocrPin,
              {
                right: 25,
                bottom: 25 + idx * 26,
                borderColor: theme.accent,
                backgroundColor: "rgba(15, 23, 42, 0.9)",
              },
            ]}
          >
            <AppIcon name="search" size={10} color={theme.accent} />
            <Text style={[styles.ocrPinText, { color: theme.accent }]}>
              "{ocr.detected_text}"
            </Text>
          </View>
        ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
  },
  gridPattern: {
    ...StyleSheet.absoluteFill,
  },
  gridLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  roomBox: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: 6,
    justifyContent: "space-between",
  },
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  roomLabel: {
    fontSize: 11,
    fontWeight: "800",
  },
  deleteBadge: {
    alignSelf: "flex-end",
    backgroundColor: "#ef4444",
    padding: 3,
    borderRadius: 4,
  },
  doorIndicator: {
    position: "absolute",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    zIndex: 15,
  },
  doorText: {
    fontSize: 9,
    fontWeight: "800",
  },
  nodePin: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    zIndex: 15,
  },
  nodeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  detectionPin: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 999,
    borderWidth: 1,
    zIndex: 10,
  },
  pinDot: { width: 6, height: 6, borderRadius: 3 },
  pinText: { fontSize: 9, fontWeight: "800" },
  ocrPin: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    zIndex: 10,
  },
  ocrPinText: {
    fontSize: 9,
    fontWeight: "700",
  },
});
