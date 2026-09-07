import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Chips } from "@/components/ui/chips";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";

export default function OCRResultsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const {
    apiOcrItems,
    updateOCRItemStatus,
    acceptAllOCRApi,
    activeSessionId,
    apiSessions,
    setActiveSessionId,
    fetchSessionArtifacts,
  } = useExtractorContext();

  const [activeChip, setActiveChip] = useState("All");

  // Ensure active session artifact fetching
  useEffect(() => {
    let targetSessionId = activeSessionId;
    if (!targetSessionId && apiSessions && apiSessions.length > 0) {
      targetSessionId = apiSessions[0].id;
      setActiveSessionId(targetSessionId);
    }
    if (targetSessionId) {
      fetchSessionArtifacts(targetSessionId);
    }
  }, [activeSessionId, apiSessions]);

  const rawItems = useMemo(() => {
    if (apiOcrItems && apiOcrItems.length > 0) {
      return apiOcrItems.map((item) => ({
        id: String(item.id),
        numericId: item.id,
        text: item.detected_text,
        category: item.category,
        confidence: Math.round(item.confidence * 100),
        accepted: item.status === "accepted",
      }));
    }
    return [];
  }, [apiOcrItems]);

  const displayItems = useMemo(() => {
    return rawItems.filter((item) => {
      if (activeChip === "All") return true;
      const cat = (item.category || "").toLowerCase();
      if (activeChip === "Rooms") {
        return cat.includes("room") || cat.includes("rm");
      }
      if (activeChip === "Depts") {
        return cat.includes("dept") || cat.includes("clinic") || cat.includes("ward") || cat.includes("station");
      }
      if (activeChip === "Signs") {
        return cat.includes("sign") || cat.includes("exit") || cat.includes("label") || cat.includes("caution");
      }
      return true;
    });
  }, [rawItems, activeChip]);

  const chips = ["All", "Rooms", "Depts", "Signs"];

  const handleToggle = (item: (typeof displayItems)[0]) => {
    if (item.numericId) {
      updateOCRItemStatus(
        item.numericId,
        item.accepted ? "pending" : "accepted",
      );
    }
  };

  const handleAcceptAll = async () => {
    if (apiOcrItems && apiOcrItems.length > 0) {
      await acceptAllOCRApi();
    }
    router.push("/map-editor");
  };

  return (
    <View style={styles.container}>
      <Heading
        tag="STEP 12"
        title="OCR Results"
        subtitle="Automatic optical text recognition from room door signs and department labels."
      />

      <Chips items={chips} selected={activeChip} onSelect={setActiveChip} />

      <View style={{ gap: 10 }}>
        {displayItems.length === 0 ? (
          <Card style={{ padding: 24, alignItems: "center", gap: 8 }}>
            <AppIcon name="search" size={32} color={theme.accent} />
            <Text style={{ color: theme.text, fontSize: 14, fontWeight: "700" }}>
              No Text Signage Detected
            </Text>
            <Text
              style={{
                color: theme.textMuted,
                fontSize: 12,
                textAlign: "center",
              }}
            >
              No readable room numbers or signs were recognized in the scanned frames.
            </Text>
          </Card>
        ) : (
          displayItems.map((item) => (
            <Card key={item.id} style={styles.ocrCard}>
              <View style={styles.ocrHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ocrText, { color: theme.text }]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.ocrCat, { color: theme.textMuted }]}>
                    {item.category}
                  </Text>
                </View>

                <View
                  style={[
                    styles.confBadge,
                    { backgroundColor: theme.primarySoft },
                  ]}
                >
                  <Text style={[styles.confText, { color: theme.accent }]}>
                    {item.confidence}%
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleToggle(item)}
                  style={[
                    styles.acceptBtn,
                    item.accepted
                      ? { backgroundColor: theme.success }
                      : {
                          backgroundColor: theme.surfaceRaised,
                          borderColor: theme.border,
                          borderWidth: 1,
                        },
                  ]}
                >
                  <Text
                    style={[
                      styles.acceptBtnText,
                      item.accepted
                        ? { color: "#ffffff" }
                        : { color: theme.textMuted },
                    ]}
                  >
                    {item.accepted ? "Accepted" : "Accept"}
                  </Text>
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </View>

      <Pressable
        onPress={handleAcceptAll}
        style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.btnText}>Accept All & Continue</Text>
        <AppIcon name="chevronRight" size={18} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  ocrCard: { padding: 12, marginBottom: 0 },
  ocrHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  ocrText: { fontSize: 15, fontWeight: "800" },
  ocrCat: { fontSize: 11, marginTop: 2 },
  confBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  confText: { fontSize: 12, fontWeight: "800" },
  acceptBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  acceptBtnText: { fontSize: 12, fontWeight: "800" },
  btnPrimary: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
});
