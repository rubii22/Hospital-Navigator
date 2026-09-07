import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";
import { Loader } from "@/components/ui/plus-loader";
import { createStyles } from "@/styles/select-location.styles";

export default function SelectLocationScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    data,
    hospitals,
    selectedBuilding,
    selectedFloor,
    selectedBuildingId,
    selectedFloorId,
    setSelectedBuilding,
    setSelectedFloor,
    selectedHospitalId,
    setSelectedHospitalId,
    setSelectedBuildingId,
    setSelectedFloorId,
    fetchHospitals,
    fetchBuildings,
    createBuilding,
    fetchFloors,
    createFloor,
    loading,
  } = useExtractorContext();

  const [expandedBuilding, setExpandedBuilding] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Modal State for adding building & floor
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [targetHospId, setTargetHospId] = useState<number | null>(null);
  const [buildingName, setBuildingName] = useState("");
  const [buildingCode, setBuildingCode] = useState("");
  const [floorName, setFloorName] = useState("Floor 1 (OPD)");
  const [floorNumber, setFloorNumber] = useState("1");
  const [creating, setCreating] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospitalId) {
      fetchBuildings(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  // Presets for Pakistani Hospital Buildings
  const buildingPresets = [
    { name: "Main Clinical Block", code: "MB" },
    { name: "Emergency & Trauma Unit", code: "EB" },
    { name: "Outpatient Department (OPD)", code: "OPD" },
    { name: "Diagnostic & Radiology Wing", code: "RAD" },
    { name: "Surgical & ICU Tower", code: "SURG" },
    { name: "Children & Maternal Care", code: "CMC" },
  ];

  const floorPresets = [
    { name: "Ground Floor", num: "0" },
    { name: "Floor 1 (OPD & Wards)", num: "1" },
    { name: "Floor 2 (Specialist Clinics)", num: "2" },
    { name: "Basement 1 (Radiology & MRI)", num: "-1" },
  ];

  const handleOpenAddModal = (hospitalId?: number) => {
    const activeId =
      hospitalId ||
      selectedHospitalId ||
      (hospitals.length > 0 ? hospitals[0].id : null);
    setTargetHospId(activeId);
    setBuildingName("Main Clinical Block");
    setBuildingCode("MB-01");
    setFloorName("Floor 1 (OPD)");
    setFloorNumber("1");
    setAddModalVisible(true);
  };

  const handleCreateBuildingAndFloor = async () => {
    if (!targetHospId) {
      showToast("⚠️ Please select a hospital first.");
      return;
    }
    if (!buildingName.trim()) {
      showToast("⚠️ Please enter a building name.");
      return;
    }
    if (!floorName.trim()) {
      showToast("⚠️ Please enter a floor name.");
      return;
    }

    setCreating(true);
    try {
      // 1. Create Building in database
      const newBuilding = await createBuilding(targetHospId, {
        name: buildingName.trim(),
        code:
          buildingCode.trim() ||
          buildingName.substring(0, 3).toUpperCase() + "-01",
        status: "active",
      });

      // 2. Create Floor in database
      const newFloor = await createFloor(newBuilding.id, {
        name: floorName.trim(),
        floor_number: parseInt(floorNumber, 10) || 1,
        display_name: String(parseInt(floorNumber, 10) || 1),
        status: "active",
      });

      // 3. Update active selections
      setSelectedHospitalId(targetHospId);
      setSelectedBuilding(newBuilding.name);
      setSelectedBuildingId(newBuilding.id);
      setSelectedFloor(newFloor.name);
      setSelectedFloorId(newFloor.id);
      setExpandedBuilding(newBuilding.name);

      await fetchHospitals();
      await fetchBuildings(targetHospId);
      await fetchFloors(newBuilding.id);

      setAddModalVisible(false);
      showToast(`✅ Created ${newBuilding.name} — ${newFloor.name}!`);
    } catch (err) {
      console.warn("Failed to create building and floor:", err);
      showToast("⚠️ Failed to create building & floor.");
    } finally {
      setCreating(false);
    }
  };

  const selectedHospitalTree = useMemo(() => {
    return data.locationTree.filter(
      (hospital) =>
        selectedHospitalId === null ||
        String(hospital.id) === String(selectedHospitalId),
    );
  }, [data.locationTree, selectedHospitalId]);

  const filteredTree = useMemo(() => {
    return selectedHospitalTree
      .map((hospital) => {
        const filteredBuildings = (hospital.children || [])
          .filter((building: any) => {
            const buildingMatches = building.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
            const hasMatchingFloor = (building.children || []).some(
              (floor: any) =>
                floor.name.toLowerCase().includes(searchQuery.toLowerCase()),
            );
            return buildingMatches || hasMatchingFloor;
          })
          .map((building: any) => {
            const filteredFloors = (building.children || []).filter(
              (floor: any) =>
                floor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                building.name.toLowerCase().includes(searchQuery.toLowerCase()),
            );
            return {
              ...building,
              children: filteredFloors,
            };
          });

        return {
          ...hospital,
          children: filteredBuildings,
        };
      })
      .filter((hospital) => {
        return (
          hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hospital.children.length > 0
        );
      });
  }, [selectedHospitalTree, searchQuery]);

  if (loading && hospitals.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
          backgroundColor: theme.background,
        }}
      >
        <Loader size={64} label="Fetching real-time hospital coordinates..." />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40 }}
      style={{ backgroundColor: theme.background }}
    >
      <View style={styles.container}>
        <Heading
          tag="STEP 2"
          title="Select Location"
          subtitle="Choose target hospital building and floor to begin scanning."
        />

        {/* Search Bar & Quick Add Button */}
        <View style={styles.topControlRow}>
          <View style={styles.searchBar}>
            <AppIcon name="search" size={16} color={theme.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search building or floor..."
              placeholderTextColor={theme.textMuted}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Text style={{ color: theme.textMuted, fontSize: 13 }}>✕</Text>
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={() => handleOpenAddModal()}
            style={styles.addBuildingHeaderBtn}
          >
            <AppIcon name="plus" size={14} color="#ffffff" />
            <Text style={styles.addBuildingHeaderBtnText}>Add Building</Text>
          </Pressable>
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

        {/* Location Tree */}
        <Card style={styles.treeCard}>
          {filteredTree.map((hospital) => {
            const hasBuildings =
              hospital.children && hospital.children.length > 0;

            return (
              <View key={hospital.id} style={{ marginBottom: 12 }}>
                {/* Hospital Header Node */}
                <View style={styles.treeNode}>
                  <View style={styles.treeHospitalLeft}>
                    <AppIcon name="hospital" size={18} color={theme.accent} />
                    <Text style={styles.treeHospitalText}>{hospital.name}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleOpenAddModal(Number(hospital.id))}
                    style={styles.addSmallBtn}
                  >
                    <AppIcon name="plus" size={12} color={theme.accent} />
                    <Text style={styles.addSmallBtnText}>Add Building</Text>
                  </Pressable>
                </View>

                {/* Buildings List */}
                {hasBuildings ? (
                  <View style={styles.treeChildren}>
                    {hospital.children.map((building: any) => {
                      const isExpanded = expandedBuilding === building.name;
                      const isSelectedB = selectedBuilding === building.name;
                      const floorCount = building.children ? building.children.length : 0;

                      return (
                        <View
                          key={building.id}
                          style={[
                            styles.buildingWrap,
                            isSelectedB && {
                              borderColor: theme.borderHighlight,
                              backgroundColor: "rgba(99, 102, 241, 0.08)",
                            },
                          ]}
                        >
                          <Pressable
                            onPress={() => {
                              const newExpand = isExpanded ? null : building.name;
                              setExpandedBuilding(newExpand);
                              setSelectedBuilding(building.name);
                              setSelectedBuildingId(Number(building.id));
                              fetchFloors(Number(building.id));
                            }}
                            style={styles.buildingRow}
                          >
                            <View style={styles.buildingIconWrap}>
                              <AppIcon name="box" size={15} color={theme.accent} />
                            </View>
                            <Text style={styles.buildingText}>
                              {building.name}
                            </Text>
                            <View style={styles.floorsCountBadge}>
                              <Text style={styles.floorsCountText}>
                                {floorCount} {floorCount === 1 ? "floor" : "floors"}
                              </Text>
                            </View>
                            <AppIcon
                              name={isExpanded ? "chevronDown" : "chevronRight"}
                              size={15}
                              color={theme.textMuted}
                            />
                          </Pressable>

                          {isExpanded && (
                            <View style={styles.floorsList}>
                              {building.children && building.children.length > 0 ? (
                                building.children.map((floor: any) => {
                                  const isSelectedF =
                                    selectedFloor === floor.name &&
                                    selectedBuilding === building.name;

                                  return (
                                    <Pressable
                                      key={floor.id}
                                      onPress={() => {
                                        setSelectedBuilding(building.name);
                                        setSelectedBuildingId(Number(building.id));
                                        setSelectedFloor(floor.name);
                                        setSelectedFloorId(Number(floor.id));
                                      }}
                                      style={[
                                        styles.floorRow,
                                        isSelectedF && {
                                          backgroundColor: theme.primary,
                                          borderColor: theme.accent,
                                        },
                                      ]}
                                    >
                                      <View
                                        style={[
                                          styles.floorRadio,
                                          isSelectedF && {
                                            borderColor: "#ffffff",
                                            backgroundColor: "#ffffff",
                                          },
                                        ]}
                                      >
                                        {isSelectedF && (
                                          <AppIcon
                                            name="check"
                                            size={10}
                                            color={theme.primary}
                                          />
                                        )}
                                      </View>
                                      <Text
                                        style={[
                                          styles.floorText,
                                          isSelectedF
                                            ? {
                                                color: "#ffffff",
                                                fontWeight: "800",
                                              }
                                            : { color: theme.text },
                                        ]}
                                      >
                                        {floor.name}
                                      </Text>
                                    </Pressable>
                                  );
                                })
                              ) : (
                                <View style={{ padding: 8 }}>
                                  <Text
                                    style={{
                                      color: theme.textMuted,
                                      fontSize: 12,
                                    }}
                                  >
                                    No floors registered yet.
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  /* Empty Building State for Hospital */
                  <View style={styles.emptyBuildingCard}>
                    <AppIcon name="box" size={26} color={theme.accent} />
                    <Text style={styles.emptyBuildingTitle}>
                      No Buildings Registered
                    </Text>
                    <Text style={styles.emptyBuildingSubtitle}>
                      This hospital doesn't have any buildings or floors yet.
                      Add a building to proceed with scanning.
                    </Text>
                    <Pressable
                      onPress={() => handleOpenAddModal(Number(hospital.id))}
                      style={styles.createBuildingActionBtn}
                    >
                      <AppIcon name="plus" size={14} color="#ffffff" />
                      <Text style={styles.createBuildingActionBtnText}>
                        Add Building & Floor
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}

          {filteredTree.length === 0 && (
            <View style={styles.emptyBuildingCard}>
              <AppIcon name="hospital" size={28} color={theme.accent} />
              <Text style={styles.emptyBuildingTitle}>
                No Locations Available
              </Text>
              <Text style={styles.emptyBuildingSubtitle}>
                Add your hospital's first building and floor to start your 3D
                LiDAR mapping session.
              </Text>
              <Pressable
                onPress={() => handleOpenAddModal()}
                style={styles.createBuildingActionBtn}
              >
                <AppIcon name="plus" size={14} color="#ffffff" />
                <Text style={styles.createBuildingActionBtnText}>
                  Add Building & Floor
                </Text>
              </Pressable>
            </View>
          )}
        </Card>

        {/* Scanning Tips Card */}
        <Card
          style={{
            backgroundColor: theme.surfaceMuted,
            borderColor: theme.border,
          }}
        >
          <View style={styles.tipRow}>
            <AppIcon name="emergency" size={18} color={theme.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Scanning Tips</Text>
              <Text style={styles.tipDesc}>
                Make sure you have permission to scan the selected floor and
                maintain a smooth walking speed of ~1 m/s.
              </Text>
            </View>
          </View>
        </Card>

        {/* Professional Footer & Continue Button */}
        <View style={styles.footerWrap}>
          {selectedBuilding && selectedFloor && selectedFloorId ? (
            <View style={styles.targetPreviewBadge}>
              <AppIcon name="location" size={12} color={theme.accent} />
              <Text style={styles.targetPreviewLabel}>Target:</Text>
              <Text style={styles.targetPreviewText} numberOfLines={1}>
                {selectedBuilding} • {selectedFloor}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => router.push("/start-scan")}
            disabled={!selectedFloorId}
            style={[
              styles.continueBtn,
              {
                backgroundColor: selectedFloorId
                  ? theme.primary
                  : theme.surfaceMuted,
                opacity: selectedFloorId ? 1 : 0.5,
              },
            ]}
          >
            <Text style={styles.continueBtnText}>
              {selectedFloorId ? "Continue to Scan" : "Select a Floor to Continue"}
            </Text>
            <AppIcon name="chevronRight" size={18} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Add Building & Floor Modal */}
      <Modal
        visible={addModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
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
                🏢 Add Building & Floor
              </Text>
              <Pressable onPress={() => setAddModalVisible(false)}>
                <Text style={{ color: theme.textMuted, fontSize: 16 }}>✕</Text>
              </Pressable>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              Define a new facility wing and initial floor for scanning.
            </Text>

            {/* Building Name Input */}
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Building Name
            </Text>
            <TextInput
              value={buildingName}
              onChangeText={(val) => {
                setBuildingName(val);
                const matchingPreset = buildingPresets.find(
                  (p) => p.name.toLowerCase() === val.toLowerCase(),
                );
                if (matchingPreset) {
                  setBuildingCode(`${matchingPreset.code}-01`);
                }
              }}
              placeholder="e.g. Main Clinical Block"
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

            {/* Quick Building Presets */}
            <View style={styles.presetSection}>
              <Text style={[styles.presetTitle, { color: theme.textMuted }]}>
                Quick Pakistani Building Presets:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.presetRow}>
                  {buildingPresets.map((preset) => (
                    <Pressable
                      key={preset.name}
                      onPress={() => {
                        setBuildingName(preset.name);
                        setBuildingCode(`${preset.code}-01`);
                      }}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor:
                            buildingName === preset.name
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
                              buildingName === preset.name
                                ? "#ffffff"
                                : theme.text,
                          },
                        ]}
                      >
                        {preset.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Initial Floor Name */}
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Initial Floor Name
            </Text>
            <TextInput
              value={floorName}
              onChangeText={setFloorName}
              placeholder="e.g. Floor 1 (OPD)"
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

            {/* Floor Presets */}
            <View style={styles.presetSection}>
              <Text style={[styles.presetTitle, { color: theme.textMuted }]}>
                Quick Floor Presets:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.presetRow}>
                  {floorPresets.map((preset) => (
                    <Pressable
                      key={preset.name}
                      onPress={() => {
                        setFloorName(preset.name);
                        setFloorNumber(preset.num);
                      }}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor:
                            floorName === preset.name
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
                              floorName === preset.name
                                ? "#ffffff"
                                : theme.text,
                          },
                        ]}
                      >
                        {preset.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              <Pressable
                onPress={() => setAddModalVisible(false)}
                style={[
                  styles.modalCancelBtn,
                  { borderColor: theme.border },
                ]}
              >
                <Text style={[styles.modalCancelText, { color: theme.text }]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleCreateBuildingAndFloor}
                disabled={creating}
                style={[
                  styles.modalConfirmBtn,
                  { backgroundColor: theme.primary, opacity: creating ? 0.7 : 1 },
                ]}
              >
                <AppIcon name="check" size={14} color="#ffffff" />
                <Text style={styles.modalConfirmText}>
                  {creating ? "Saving..." : "Create & Select"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
