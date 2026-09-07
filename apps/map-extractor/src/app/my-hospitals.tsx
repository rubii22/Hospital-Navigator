import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";
import { Loader } from "@/components/ui/plus-loader";
import { HospitalCreate, HospitalResponse } from "@/api/types";
import { createStyles } from "@/styles/my-hospitals.styles";

export default function MyHospitalsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles(theme);
  const {
    myHospitals,
    fetchMyHospitals,
    createHospital,
    updateHospital,
    deleteHospital,
    selectedHospitalId,
    setSelectedHospitalId,
    loading,
  } = useExtractorContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formWebsite, setFormWebsite] = useState("");
  const [formTimezone, setFormTimezone] = useState("");
  const [formLat, setFormLat] = useState("");
  const [formLng, setFormLng] = useState("");

  // Load user's hospitals on mount
  useEffect(() => {
    fetchMyHospitals();
  }, []);

  const filteredHospitals = myHospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.address &&
        h.address.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const generateHospitalCode = (name: string, address: string = "") => {
    const cleanName = name.trim();
    if (!cleanName) {
      return `PK-HOSP-${Math.floor(100 + Math.random() * 900)}`;
    }

    let cityTag = "PK";
    const lowerAddr = (address + " " + cleanName).toLowerCase();
    if (lowerAddr.includes("lahore") || lowerAddr.includes("lhr"))
      cityTag = "LHE";
    else if (lowerAddr.includes("karachi") || lowerAddr.includes("khi"))
      cityTag = "KHI";
    else if (lowerAddr.includes("islamabad") || lowerAddr.includes("isb"))
      cityTag = "ISB";
    else if (lowerAddr.includes("rawalpindi") || lowerAddr.includes("rwp"))
      cityTag = "RWP";
    else if (lowerAddr.includes("peshawar") || lowerAddr.includes("pew"))
      cityTag = "PEW";
    else if (lowerAddr.includes("faisalabad") || lowerAddr.includes("fsd"))
      cityTag = "FSD";
    else if (lowerAddr.includes("multan") || lowerAddr.includes("mux"))
      cityTag = "MUX";
    else if (lowerAddr.includes("quetta") || lowerAddr.includes("uet"))
      cityTag = "UET";

    const words = cleanName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter(
        (w) =>
          ![
            "hospital",
            "clinic",
            "center",
            "centre",
            "and",
            "the",
            "of",
          ].includes(w.toLowerCase()),
      );

    let prefix = "";
    if (words.length === 0) {
      prefix = "HOSP";
    } else if (words.length === 1) {
      prefix = words[0].slice(0, 4).toUpperCase();
    } else {
      prefix = words
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 5);
    }

    const randomSuffix = Math.floor(10 + Math.random() * 90);
    return `PK-${prefix}-${cityTag}-${randomSuffix}`;
  };

  const handleNameChange = (text: string) => {
    setFormName(text);
    if (!editingId && (!formCode || formCode.startsWith("PK-"))) {
      setFormCode(generateHospitalCode(text, formAddress));
    }
  };

  const handleAddressChange = (text: string) => {
    setFormAddress(text);
    if (!editingId && (!formCode || formCode.startsWith("PK-"))) {
      setFormCode(generateHospitalCode(formName, text));
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormName("");
    setFormCode(generateHospitalCode(""));
    setFormDesc("");
    setFormAddress("");
    setFormPhone("");
    setFormEmail("");
    setFormWebsite("");
    setFormTimezone("Asia/Karachi");
    setFormLat("");
    setFormLng("");
    setIsModalOpen(true);
  };

  const openEditModal = (h: HospitalResponse) => {
    setEditingId(h.id);
    setFormName(h.name);
    setFormCode(h.code);
    setFormDesc(h.description || "");
    setFormAddress(h.address || "");
    setFormPhone(h.phone || "");
    setFormEmail(h.email || "");
    setFormWebsite(h.website || "");
    setFormTimezone(h.timezone || "Asia/Karachi");
    setFormLat(
      h.latitude !== undefined && h.latitude !== null ? String(h.latitude) : "",
    );
    setFormLng(
      h.longitude !== undefined && h.longitude !== null
        ? String(h.longitude)
        : "",
    );
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName || !formCode) {
      Alert.alert(
        "Error",
        "Hospital Name and unique Code are required fields.",
      );
      return;
    }

    const payload: HospitalCreate = {
      name: formName,
      code: formCode,
      description: formDesc || undefined,
      address: formAddress || undefined,
      phone: formPhone || undefined,
      email: formEmail || undefined,
      website: formWebsite || undefined,
      timezone: formTimezone || undefined,
      latitude: formLat ? parseFloat(formLat) : undefined,
      longitude: formLng ? parseFloat(formLng) : undefined,
    };

    try {
      if (editingId) {
        await updateHospital(editingId, payload);
        Alert.alert("Success", "Hospital updated successfully.");
      } else {
        await createHospital(payload);
        Alert.alert("Success", "Hospital registered successfully.");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      Alert.alert("Error Saving", err.message || "Something went wrong.");
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${name}? This will remove all associated mapping configurations.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHospital(id);
              Alert.alert("Deleted", "Hospital removed successfully.");
            } catch (err: any) {
              Alert.alert(
                "Error deleting",
                err.message || "Something went wrong.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{ backgroundColor: theme.background }}
    >
      <View style={styles.container}>
        <Heading
          tag="MANAGE"
          title="My Hospitals"
          subtitle="View, edit, or register hospitals to manage their digital twins and navigation systems."
        />

        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderHighlight,
            },
          ]}
        >
          <AppIcon name="search" size={18} color={theme.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search hospitals..."
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <AppIcon name="xCircle" size={16} color={theme.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {loading && myHospitals.length === 0 ? (
          <View style={styles.centerWrap}>
            <Loader size={48} label="Loading your hospitals..." />
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {filteredHospitals.map((hospital) => {
              const isExpanded = expandedId === hospital.id;
              const isActive = selectedHospitalId === hospital.id;

              return (
                <Card
                  key={hospital.id}
                  style={[
                    styles.hospitalCard,
                    { backgroundColor: theme.surface },
                    isActive && { borderColor: theme.accent, borderWidth: 1.5 },
                  ]}
                >
                  <Pressable
                    onPress={() =>
                      setExpandedId(isExpanded ? null : hospital.id)
                    }
                    style={styles.cardHeader}
                  >
                    <View style={styles.headerInfo}>
                      <View
                        style={[
                          styles.hIcon,
                          { backgroundColor: theme.primarySoft },
                        ]}
                      >
                        <AppIcon
                          name="hospital"
                          size={20}
                          color={theme.accent}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.hName, { color: theme.text }]}>
                          {hospital.name}
                        </Text>
                        <Text
                          style={[styles.hCode, { color: theme.textMuted }]}
                        >
                          Code: {hospital.code} {isActive && "· Active"}
                        </Text>
                      </View>
                    </View>
                    <AppIcon
                      name={isExpanded ? "chevronDown" : "chevronRight"}
                      size={18}
                      color={theme.textMuted}
                    />
                  </Pressable>

                  {isExpanded && (
                    <View
                      style={[
                        styles.detailsWrap,
                        { borderTopColor: theme.border },
                      ]}
                    >
                      {hospital.description ? (
                        <Text style={[styles.descText, { color: theme.text }]}>
                          {hospital.description}
                        </Text>
                      ) : null}

                      <View style={styles.detailsGrid}>
                        <DetailRow
                          label="Address"
                          value={hospital.address}
                          theme={theme}
                        />
                        <DetailRow
                          label="Phone"
                          value={hospital.phone}
                          theme={theme}
                        />
                        <DetailRow
                          label="Email"
                          value={hospital.email}
                          theme={theme}
                        />
                        <DetailRow
                          label="Website"
                          value={hospital.website}
                          theme={theme}
                        />
                        <DetailRow
                          label="Timezone"
                          value={hospital.timezone}
                          theme={theme}
                        />
                        {hospital.latitude !== undefined &&
                          hospital.longitude !== undefined && (
                            <DetailRow
                              label="Coordinates"
                              value={`${hospital.latitude?.toFixed(5)}, ${hospital.longitude?.toFixed(5)}`}
                              theme={theme}
                            />
                          )}
                      </View>

                      <View style={styles.actionsBar}>
                        {!isActive ? (
                          <Pressable
                            onPress={() => setSelectedHospitalId(hospital.id)}
                            style={[
                              styles.actionBtn,
                              { backgroundColor: theme.primary },
                            ]}
                          >
                            <AppIcon name="check" size={14} color="#ffffff" />
                            <Text style={styles.actionBtnText}>Set Active</Text>
                          </Pressable>
                        ) : (
                          <View
                            style={[
                              styles.activeIndicator,
                              { backgroundColor: theme.successSoft },
                            ]}
                          >
                            <Text
                              style={[
                                styles.activeIndicatorText,
                                { color: theme.success },
                              ]}
                            >
                              Active Session
                            </Text>
                          </View>
                        )}

                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <Pressable
                            onPress={() => openEditModal(hospital)}
                            style={[
                              styles.iconActionBtn,
                              {
                                backgroundColor: theme.surfaceRaised,
                                borderColor: theme.border,
                              },
                            ]}
                          >
                            <AppIcon
                              name="sliders"
                              size={14}
                              color={theme.text}
                            />
                          </Pressable>
                          <Pressable
                            onPress={() =>
                              handleDelete(hospital.id, hospital.name)
                            }
                            style={[
                              styles.iconActionBtn,
                              {
                                backgroundColor: theme.dangerSoft,
                                borderColor: theme.danger,
                              },
                            ]}
                          >
                            <AppIcon
                              name="trash"
                              size={14}
                              color={theme.danger}
                            />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  )}
                </Card>
              );
            })}

            {filteredHospitals.length === 0 && (
              <View style={styles.emptyWrap}>
                <AppIcon name="globe" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  No hospitals registered yet. Click below to add one.
                </Text>
              </View>
            )}
          </View>
        )}

        <Pressable
          onPress={openAddModal}
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
        >
          <AppIcon name="plus" size={18} color="#ffffff" />
          <Text style={styles.addBtnText}>Add Hospital</Text>
        </Pressable>
      </View>

      {/* Add/Edit Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingId ? "Edit Hospital" : "Add Hospital"}
              </Text>
              <Pressable onPress={() => setIsModalOpen(false)}>
                <AppIcon name="xCircle" size={24} color={theme.textMuted} />
              </Pressable>
            </View>

            <ScrollView style={styles.formScroll}>
              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.textMuted }]}>
                  Hospital Name *
                </Text>
                <TextInput
                  value={formName}
                  onChangeText={handleNameChange}
                  placeholder="e.g. Shaukat Khanum Memorial Hospital"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.surfaceMuted,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.formField}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Text style={[styles.label, { color: theme.textMuted }]}>
                    Unique Code *
                  </Text>
                  <Pressable
                    onPress={() =>
                      setFormCode(generateHospitalCode(formName, formAddress))
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <AppIcon name="refresh" size={12} color={theme.accent} />
                    <Text
                      style={{
                        color: theme.accent,
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      Auto Generate
                    </Text>
                  </Pressable>
                </View>
                <TextInput
                  value={formCode}
                  onChangeText={setFormCode}
                  placeholder="e.g. PK-SKM-LHE-01"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.surfaceMuted,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.textMuted }]}>
                  Description
                </Text>
                <TextInput
                  value={formDesc}
                  onChangeText={setFormDesc}
                  multiline={true}
                  numberOfLines={2}
                  placeholder="e.g. Tertiary care medical & cancer diagnostic center"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.inputMulti,
                    {
                      color: theme.text,
                      backgroundColor: theme.surfaceMuted,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.textMuted }]}>
                  Address
                </Text>
                <TextInput
                  value={formAddress}
                  onChangeText={handleAddressChange}
                  placeholder="e.g. 7A Block R-3, Johar Town, Lahore, Punjab"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.surfaceMuted,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.textMuted }]}>
                  Phone Number
                </Text>
                <TextInput
                  value={formPhone}
                  onChangeText={setFormPhone}
                  placeholder="e.g. +92 42 35905000"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.surfaceMuted,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.textMuted }]}>
                  Email
                </Text>
                <TextInput
                  value={formEmail}
                  onChangeText={setFormEmail}
                  placeholder="e.g. info@shaukatkhanum.org.pk"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.surfaceMuted,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.textMuted }]}>
                  Website
                </Text>
                <TextInput
                  value={formWebsite}
                  onChangeText={setFormWebsite}
                  placeholder="e.g. https://shaukatkhanum.org.pk"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.surfaceMuted,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.textMuted }]}>
                  Timezone
                </Text>
                <TextInput
                  value={formTimezone}
                  onChangeText={setFormTimezone}
                  placeholder="e.g. Asia/Karachi"
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.surfaceMuted,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.coordRow}>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.textMuted }]}>
                    Latitude
                  </Text>
                  <TextInput
                    value={formLat}
                    onChangeText={setFormLat}
                    keyboardType="numeric"
                    placeholder="e.g. 31.4727"
                    placeholderTextColor={theme.textMuted}
                    style={[
                      styles.input,
                      {
                        color: theme.text,
                        backgroundColor: theme.surfaceMuted,
                        borderColor: theme.border,
                      },
                    ]}
                  />
                </View>
                <View style={[styles.formField, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.textMuted }]}>
                    Longitude
                  </Text>
                  <TextInput
                    value={formLng}
                    onChangeText={setFormLng}
                    keyboardType="numeric"
                    placeholder="e.g. 74.2728"
                    placeholderTextColor={theme.textMuted}
                    style={[
                      styles.input,
                      {
                        color: theme.text,
                        backgroundColor: theme.surfaceMuted,
                        borderColor: theme.border,
                      },
                    ]}
                  />
                </View>
              </View>
            </ScrollView>

            <Pressable
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.saveBtnText}>
                {editingId ? "Save Changes" : "Register Hospital"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function DetailRow({
  label,
  value,
  theme,
}: {
  label: string;
  value?: string;
  theme: any;
}) {
  if (!value) return null;
  const styles = createStyles(theme);

  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}
