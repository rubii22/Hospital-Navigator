import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { FloorplanCanvas } from "@/components/ui/floorplan-canvas";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";
import { VectorMapData } from "@/api/types";

interface CanvasSnapshot {
  rooms: any[];
  doors: any[];
  nodes: any[];
}

export default function MapEditorScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    selectedBuilding,
    selectedFloor,
    selectedFloorId,
    apiMapData,
    apiOcrItems,
    saveVectorMapApi,
    activeSessionId,
    fetchSessionArtifacts,
  } = useExtractorContext();

  const [activeTool, setActiveTool] = useState<
    "Select" | "Add Room" | "Add Door" | "Add Node" | "Delete"
  >("Select");
  const [rotation, setRotation] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Dynamic Map State
  const [rooms, setRooms] = useState<any[]>([]);
  const [doors, setDoors] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);

  // Selection & Inspector
  const [selectedElement, setSelectedElement] = useState<{
    type: "room" | "door" | "node";
    data: any;
  } | null>(null);
  const [editNameInput, setEditNameInput] = useState("");

  // History for Undo / Redo
  const [history, setHistory] = useState<CanvasSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Modal State for Adding Elements
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"room" | "door" | "node">("room");
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number }>({
    x: 50,
    y: 50,
  });
  const [newElementName, setNewElementName] = useState("");
  const [selectedNodeType, setSelectedNodeType] = useState<string>("waypoint");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Initialize data from API or OCR items
  useEffect(() => {
    if (activeSessionId) {
      fetchSessionArtifacts(activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    let initialRooms: any[] = [];
    let initialDoors: any[] = [];
    let initialNodes: any[] = [];

    if (apiMapData) {
      if (apiMapData.rooms && apiMapData.rooms.length > 0) {
        initialRooms = [...apiMapData.rooms];
      }
      if (apiMapData.doors && apiMapData.doors.length > 0) {
        initialDoors = [...apiMapData.doors];
      }
      if (apiMapData.nodes && apiMapData.nodes.length > 0) {
        initialNodes = [...apiMapData.nodes];
      }
    }

    setRooms(initialRooms);
    setDoors(initialDoors);
    setNodes(initialNodes);

    const initialSnapshot: CanvasSnapshot = {
      rooms: initialRooms,
      doors: initialDoors,
      nodes: initialNodes,
    };
    setHistory([initialSnapshot]);
    setHistoryIndex(0);
  }, [apiMapData, apiOcrItems, activeSessionId]);

  // Helper to push history snapshots
  const recordHistory = useCallback(
    (newRooms: any[], newDoors: any[], newNodes: any[]) => {
      const newSnapshot: CanvasSnapshot = {
        rooms: newRooms,
        doors: newDoors,
        nodes: newNodes,
      };
      setHistory((prev) => {
        const truncated = prev.slice(0, historyIndex + 1);
        return [...truncated, newSnapshot];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex],
  );

  // Toolbar Tools Definition
  const tools: {
    name: "Select" | "Add Room" | "Add Door" | "Add Node" | "Delete";
    icon: string;
  }[] = [
    { name: "Select", icon: "sliders" },
    { name: "Add Room", icon: "plus" },
    { name: "Add Door", icon: "room" },
    { name: "Add Node", icon: "location" },
    { name: "Delete", icon: "trash" },
  ];

  // Presets for quick Pakistani room naming
  const roomPresets = [
    "Consultation Room 1",
    "Emergency Triage",
    "OPD Clinic",
    "Radiology & X-Ray",
    "ICU Ward",
    "Pharmacy Counter",
    "Doctor's Cabin",
    "Washroom",
  ];

  const doorPresets = [
    "Main Entrance Door",
    "Emergency Exit",
    "Double Swing Door",
    "Corridor Door",
  ];

  const nodeTypes = [
    { label: "Waypoint", type: "waypoint", icon: "location" },
    { label: "Reception Desk", type: "reception", icon: "users" },
    { label: "Elevator", type: "elevator", icon: "sliders" },
    { label: "Stairwell", type: "stairs", icon: "clock" },
    { label: "Pharmacy", type: "pharmacy", icon: "plus" },
  ];

  // Handle Canvas Tap
  const handleCanvasPress = (coords: { x: number; y: number }) => {
    setPendingCoords(coords);

    if (activeTool === "Add Room") {
      setModalType("room");
      setNewElementName(`Room ${rooms.length + 1}`);
      setModalVisible(true);
    } else if (activeTool === "Add Door") {
      setModalType("door");
      setNewElementName(`Door ${doors.length + 1}`);
      setModalVisible(true);
    } else if (activeTool === "Add Node") {
      setModalType("node");
      setNewElementName(`Node ${nodes.length + 1}`);
      setSelectedNodeType("waypoint");
      setModalVisible(true);
    } else if (activeTool === "Select") {
      setSelectedElement(null);
    }
  };

  // Confirm Modal Creation
  const handleConfirmCreate = () => {
    if (modalType === "room") {
      const newRoom = {
        id: `r_${Date.now()}`,
        name: newElementName.trim() || `Room ${rooms.length + 1}`,
        x: Math.max(10, Math.min(220, pendingCoords.x - 40)),
        y: Math.max(10, Math.min(200, pendingCoords.y - 30)),
        width: 120,
        height: 80,
      };
      const updated = [...rooms, newRoom];
      setRooms(updated);
      recordHistory(updated, doors, nodes);
      showToast(`➕ Room "${newRoom.name}" placed!`);
    } else if (modalType === "door") {
      const newDoor = {
        id: `d_${Date.now()}`,
        name: newElementName.trim() || `Door ${doors.length + 1}`,
        x: Math.max(10, Math.min(260, pendingCoords.x)),
        y: Math.max(10, Math.min(240, pendingCoords.y)),
      };
      const updated = [...doors, newDoor];
      setDoors(updated);
      recordHistory(rooms, updated, nodes);
      showToast(`🚪 Door "${newDoor.name}" placed!`);
    } else if (modalType === "node") {
      const newNode = {
        id: `n_${Date.now()}`,
        label: newElementName.trim() || `Node ${nodes.length + 1}`,
        type: selectedNodeType,
        x: Math.max(10, Math.min(260, pendingCoords.x)),
        y: Math.max(10, Math.min(240, pendingCoords.y)),
        z: 0,
        accessible: true,
      };
      const updated = [...nodes, newNode];
      setNodes(updated);
      recordHistory(rooms, doors, updated);
      showToast(`📍 Node "${newNode.label}" (${selectedNodeType}) placed!`);
    }

    setModalVisible(false);
  };

  // Handle Element Deletion
  const handleDeleteElement = (type: "room" | "door" | "node", id: string) => {
    let updatedRooms = rooms;
    let updatedDoors = doors;
    let updatedNodes = nodes;

    if (type === "room") {
      updatedRooms = rooms.filter((r) => String(r.id) !== id);
      setRooms(updatedRooms);
    } else if (type === "door") {
      updatedDoors = doors.filter((d) => String(d.id) !== id);
      setDoors(updatedDoors);
    } else if (type === "node") {
      updatedNodes = nodes.filter((n) => String(n.id) !== id);
      setNodes(updatedNodes);
    }

    recordHistory(updatedRooms, updatedDoors, updatedNodes);
    if (selectedElement && String(selectedElement.data.id) === id) {
      setSelectedElement(null);
    }
    showToast(`🗑️ ${type.toUpperCase()} removed`);
  };

  // Handle Select Element
  const handleSelectElement = (elem: {
    type: "room" | "door" | "node";
    data: any;
  }) => {
    setSelectedElement(elem);
    setEditNameInput(elem.data.name || elem.data.label || "");
  };

  // Save Name in Inspector
  const handleSaveInspectorName = () => {
    if (!selectedElement) return;
    const { type, data } = selectedElement;
    const id = String(data.id);
    const newName = editNameInput.trim();
    if (!newName) return;

    if (type === "room") {
      const updated = rooms.map((r) =>
        String(r.id) === id ? { ...r, name: newName } : r,
      );
      setRooms(updated);
      recordHistory(updated, doors, nodes);
    } else if (type === "door") {
      const updated = doors.map((d) =>
        String(d.id) === id ? { ...d, name: newName } : d,
      );
      setDoors(updated);
      recordHistory(rooms, updated, nodes);
    } else if (type === "node") {
      const updated = nodes.map((n) =>
        String(n.id) === id ? { ...n, label: newName } : n,
      );
      setNodes(updated);
      recordHistory(rooms, doors, updated);
    }

    setSelectedElement((prev) =>
      prev
        ? { ...prev, data: { ...prev.data, name: newName, label: newName } }
        : null,
    );
    showToast("✅ Name updated!");
  };

  // Undo Handler
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      const snap = history[newIdx];
      setRooms(snap.rooms);
      setDoors(snap.doors);
      setNodes(snap.nodes);
      setHistoryIndex(newIdx);
      showToast("↩️ Undone");
    } else {
      showToast("No further undo available");
    }
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      const snap = history[newIdx];
      setRooms(snap.rooms);
      setDoors(snap.doors);
      setNodes(snap.nodes);
      setHistoryIndex(newIdx);
      showToast("↪️ Redone");
    } else {
      showToast("No further redo available");
    }
  };

  // Rotate Handler
  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    showToast(`🔄 Rotated ${nextRot}°`);
  };

  // Fit / Reset View
  const handleFit = () => {
    setRotation(0);
    showToast("🔍 Canvas centered & fitted");
  };

  // Save to Central Database
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Rebuild edges connecting adjacent nodes
      const edges = nodes.slice(1).map((node, i) => {
        const prev = nodes[i];
        const dist = Math.round(
          Math.sqrt(
            Math.pow(Number(node.x) - Number(prev.x), 2) +
              Math.pow(Number(node.y) - Number(prev.y), 2),
          ),
        );
        return {
          id: `e_${i + 1}`,
          from_node: String(prev.id || `n_${i}`),
          to_node: String(node.id || `n_${i + 1}`),
          distance: Math.max(1, dist),
          accessible: true,
          edge_type: "pathway",
        };
      });

      const vectorPayload: VectorMapData = {
        schema_version: "1.0",
        session_id: activeSessionId || 1,
        floor_id: selectedFloorId || 1,
        nodes: nodes.map((n, i) => ({
          id: String(n.id || `n_${i}`),
          label: n.label || n.name || `Node ${i + 1}`,
          type: n.type || "waypoint",
          x: Number(n.x) || 0,
          y: Number(n.y) || 0,
          z: 0,
          accessible: true,
        })),
        edges,
        rooms,
        doors,
      };

      await saveVectorMapApi(vectorPayload);
      showToast("💾 Saved successfully to central database!");
      setTimeout(() => {
        router.push("/map-details");
      }, 600);
    } catch (err) {
      console.warn("Failed to save CAD map changes:", err);
      showToast("⚠️ Error saving changes to DB");
    } finally {
      setSaving(false);
    }
  };

  // Tool Instruction Helper
  const getToolInstruction = () => {
    switch (activeTool) {
      case "Add Room":
        return "➕ Tap anywhere on the floorplan to place and label a new room polygon.";
      case "Add Door":
        return "🚪 Tap on any room boundary or wall to insert a navigation door.";
      case "Add Node":
        return "📍 Tap to place waypoints, elevators, or reception check-in desks.";
      case "Delete":
        return "🗑️ Tap any room, door, or node to remove it from the map.";
      default:
        return "👆 Tap any element on the floorplan to inspect or edit its properties.";
    }
  };

  return (
    <View style={styles.container}>
      <Heading
        tag="STEP 13"
        title="Edit Map"
        subtitle={`${selectedBuilding} - ${selectedFloor}`}
      />

      {/* Instructional Tooltip Banner */}
      <View
        style={[
          styles.toolBanner,
          {
            backgroundColor:
              activeTool === "Delete"
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(99, 102, 241, 0.12)",
            borderColor: activeTool === "Delete" ? theme.danger : theme.accent,
          },
        ]}
      >
        <AppIcon
          name={
            activeTool === "Delete"
              ? "trash"
              : activeTool === "Select"
                ? "sliders"
                : "location"
          }
          size={14}
          color={activeTool === "Delete" ? theme.danger : theme.accent}
        />
        <Text
          style={[
            styles.bannerText,
            { color: activeTool === "Delete" ? theme.danger : theme.text },
          ]}
        >
          {getToolInstruction()}
        </Text>
      </View>

      {/* Toast Notification */}
      {toast && (
        <View
          style={[
            styles.toastBox,
            { backgroundColor: "rgba(16, 185, 129, 0.95)" },
          ]}
        >
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {/* Main Floorplan Canvas with Editor Controls */}
      <View style={styles.editorWrap}>
        <FloorplanCanvas
          showOverlay={false}
          height={300}
          editable={true}
          activeTool={activeTool}
          rotation={rotation}
          selectedElement={
            selectedElement
              ? {
                  type: selectedElement.type,
                  id: String(selectedElement.data.id),
                }
              : null
          }
          customRooms={rooms}
          customDoors={doors}
          customNodes={nodes}
          onCanvasPress={handleCanvasPress}
          onDeleteElement={handleDeleteElement}
          onSelectElement={handleSelectElement}
        />

        {/* Right-Side Editor Toolbar */}
        <View style={styles.rightTools}>
          {tools.map((t) => {
            const isActive = activeTool === t.name;
            return (
              <Pressable
                key={t.name}
                onPress={() => {
                  setActiveTool(t.name);
                  setSelectedElement(null);
                }}
                style={[
                  styles.toolBtn,
                  isActive
                    ? {
                        backgroundColor:
                          t.name === "Delete" ? theme.danger : theme.primary,
                        borderColor:
                          t.name === "Delete" ? "#fca5a5" : theme.accent,
                      }
                    : {
                        backgroundColor: "rgba(10, 15, 29, 0.9)",
                        borderColor: theme.border,
                      },
                ]}
              >
                <AppIcon
                  name={t.icon as any}
                  size={15}
                  color={isActive ? "#ffffff" : theme.textMuted}
                />
                <Text
                  style={[
                    styles.toolText,
                    { color: isActive ? "#ffffff" : theme.textMuted },
                  ]}
                >
                  {t.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Bottom Editor Action Bar (Undo, Redo, Rotate, Fit) */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: "rgba(10, 15, 29, 0.95)",
              borderColor: theme.borderHighlight,
            },
          ]}
        >
          <Pressable
            onPress={handleUndo}
            disabled={historyIndex <= 0}
            style={[styles.actBtn, { opacity: historyIndex > 0 ? 1 : 0.35 }]}
          >
            <AppIcon name="rotate" size={15} color={theme.text} />
            <Text style={[styles.actBtnText, { color: theme.text }]}>Undo</Text>
          </Pressable>

          <Pressable
            onPress={handleRedo}
            disabled={historyIndex >= history.length - 1}
            style={[
              styles.actBtn,
              { opacity: historyIndex < history.length - 1 ? 1 : 0.35 },
            ]}
          >
            <AppIcon name="rotate" size={15} color={theme.text} />
            <Text style={[styles.actBtnText, { color: theme.text }]}>Redo</Text>
          </Pressable>

          <Pressable onPress={handleRotate} style={styles.actBtn}>
            <AppIcon name="refresh" size={15} color={theme.accent} />
            <Text style={[styles.actBtnText, { color: theme.accent }]}>
              {rotation > 0 ? `${rotation}°` : "Rotate"}
            </Text>
          </Pressable>

          <Pressable onPress={handleFit} style={styles.actBtn}>
            <AppIcon name="maximize" size={15} color={theme.text} />
            <Text style={[styles.actBtnText, { color: theme.text }]}>Fit</Text>
          </Pressable>
        </View>
      </View>

      {/* Selected Element Inspector Panel */}
      {selectedElement && (
        <Card style={styles.inspectorCard}>
          <View style={styles.inspectorHeader}>
            <View style={styles.inspectorBadge}>
              <Text style={styles.inspectorBadgeText}>
                {selectedElement.type.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.inspectorTitle, { color: theme.text }]}>
              Edit Selected {selectedElement.type}
            </Text>
            <Pressable
              onPress={() => setSelectedElement(null)}
              style={styles.closeBtn}
            >
              <Text style={{ color: theme.textMuted, fontSize: 13 }}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.inspectorRow}>
            <TextInput
              value={editNameInput}
              onChangeText={setEditNameInput}
              placeholder="Enter name / label"
              placeholderTextColor={theme.textMuted}
              style={[
                styles.inspectorInput,
                {
                  color: theme.text,
                  backgroundColor: theme.surfaceMuted,
                  borderColor: theme.border,
                },
              ]}
            />
            <Pressable
              onPress={handleSaveInspectorName}
              style={[
                styles.saveInspectorBtn,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text style={styles.saveInspectorBtnText}>Save</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                handleDeleteElement(
                  selectedElement.type,
                  String(selectedElement.data.id),
                )
              }
              style={[
                styles.deleteInspectorBtn,
                { backgroundColor: theme.danger },
              ]}
            >
              <AppIcon name="trash" size={14} color="#ffffff" />
            </Pressable>
          </View>
        </Card>
      )}

      {/* Save Changes Button */}
      <Pressable
        onPress={handleSaveChanges}
        disabled={saving}
        style={[
          styles.btnPrimary,
          { backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 },
        ]}
      >
        <AppIcon name="check" size={18} color="#ffffff" />
        <Text style={styles.btnText}>
          {saving ? "Saving to Database..." : "Save Changes"}
        </Text>
      </Pressable>

      {/* Creation Modal for Add Room / Door / Node */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderHighlight,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {modalType === "room"
                  ? "➕ Add New Room"
                  : modalType === "door"
                    ? "🚪 Place Navigation Door"
                    : "📍 Place POI / Waypoint"}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={{ color: theme.textMuted, fontSize: 16 }}>✕</Text>
              </Pressable>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              Position: ({pendingCoords.x}, {pendingCoords.y})
            </Text>

            {/* Input Name */}
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              {modalType === "room"
                ? "Room Name"
                : modalType === "door"
                  ? "Door Name"
                  : "Node / POI Label"}
            </Text>
            <TextInput
              value={newElementName}
              onChangeText={setNewElementName}
              placeholder={
                modalType === "room"
                  ? "e.g., Consultation Room 1"
                  : modalType === "door"
                    ? "e.g., Main Door"
                    : "e.g., Reception Check-In"
              }
              placeholderTextColor={theme.textMuted}
              style={[
                styles.modalInput,
                {
                  color: theme.text,
                  backgroundColor: theme.surfaceMuted,
                  borderColor: theme.border,
                },
              ]}
            />

            {/* Quick Presets for Rooms */}
            {modalType === "room" && (
              <View style={styles.presetSection}>
                <Text style={[styles.presetTitle, { color: theme.textMuted }]}>
                  Quick Pakistani Room Presets:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.presetRow}>
                    {roomPresets.map((preset) => (
                      <Pressable
                        key={preset}
                        onPress={() => setNewElementName(preset)}
                        style={[
                          styles.presetChip,
                          {
                            backgroundColor:
                              newElementName === preset
                                ? theme.primary
                                : theme.surfaceMuted,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            {
                              color:
                                newElementName === preset
                                  ? "#ffffff"
                                  : theme.text,
                            },
                          ]}
                        >
                          {preset}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Quick Presets for Doors */}
            {modalType === "door" && (
              <View style={styles.presetSection}>
                <Text style={[styles.presetTitle, { color: theme.textMuted }]}>
                  Quick Door Presets:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.presetRow}>
                    {doorPresets.map((preset) => (
                      <Pressable
                        key={preset}
                        onPress={() => setNewElementName(preset)}
                        style={[
                          styles.presetChip,
                          {
                            backgroundColor:
                              newElementName === preset
                                ? theme.primary
                                : theme.surfaceMuted,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            {
                              color:
                                newElementName === preset
                                  ? "#ffffff"
                                  : theme.text,
                            },
                          ]}
                        >
                          {preset}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Node Type Selector */}
            {modalType === "node" && (
              <View style={styles.presetSection}>
                <Text style={[styles.presetTitle, { color: theme.textMuted }]}>
                  Select Node Type:
                </Text>
                <View style={styles.nodeTypeGrid}>
                  {nodeTypes.map((nt) => {
                    const isSel = selectedNodeType === nt.type;
                    return (
                      <Pressable
                        key={nt.type}
                        onPress={() => {
                          setSelectedNodeType(nt.type);
                          if (
                            !newElementName ||
                            newElementName.startsWith("Node")
                          ) {
                            setNewElementName(nt.label);
                          }
                        }}
                        style={[
                          styles.nodeTypeBtn,
                          {
                            backgroundColor: isSel
                              ? theme.primary
                              : theme.surfaceMuted,
                            borderColor: isSel ? theme.accent : theme.border,
                          },
                        ]}
                      >
                        <AppIcon
                          name={nt.icon as any}
                          size={13}
                          color={isSel ? "#ffffff" : theme.text}
                        />
                        <Text
                          style={[
                            styles.nodeTypeText,
                            { color: isSel ? "#ffffff" : theme.text },
                          ]}
                        >
                          {nt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
              >
                <Text style={[styles.modalCancelText, { color: theme.text }]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmCreate}
                style={[
                  styles.modalConfirmBtn,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Text style={styles.modalConfirmText}>Add to Floorplan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, paddingBottom: 24 },
  toolBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  bannerText: {
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  toastBox: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "center",
  },
  toastText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  editorWrap: { position: "relative" },
  rightTools: {
    position: "absolute",
    right: 10,
    top: 10,
    gap: 6,
    zIndex: 20,
  },
  toolBtn: {
    width: 66,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  toolText: { fontSize: 9, fontWeight: "700" },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: -8,
  },
  actBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  actBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  inspectorCard: {
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  inspectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inspectorBadge: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inspectorBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
  },
  inspectorTitle: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  inspectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inspectorInput: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  saveInspectorBtn: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  saveInspectorBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  deleteInspectorBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  btnPrimary: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  modalSubtitle: {
    fontSize: 11,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalInput: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  presetSection: {
    gap: 6,
  },
  presetTitle: {
    fontSize: 11,
    fontWeight: "600",
  },
  presetRow: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  nodeTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  nodeTypeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  nodeTypeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 6,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalConfirmText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
});
