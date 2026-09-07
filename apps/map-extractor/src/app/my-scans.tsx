import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Chips } from "@/components/ui/chips";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";

export default function MyScansScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { sessions, fetchSessions, setActiveSessionId } = useExtractorContext();

  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = ["All", "Completed", "Processing", "Failed"];

  // Reload history logs from FastAPI database on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    const matchesTab = activeTab === "All" || s.status === activeTab;
    const matchesSearch =
      s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.jobId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <Heading
        tag="STEP 16"
        title="My Scans"
        subtitle="Session history log of all completed, processing, and archived scan jobs."
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
          placeholder="Search scans..."
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <AppIcon name="xCircle" size={16} color={theme.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <Chips items={tabs} selected={activeTab} onSelect={setActiveTab} />

      <View style={{ gap: 10 }}>
        {filteredSessions.map((session) => {
          const isCompleted = session.status === "Completed";
          const isProcessing = session.status === "Processing";
          const isFailed = session.status === "Failed";

          return (
            <Card
              key={session.id}
              onPress={() => {
                setActiveSessionId(Number(session.id));
                router.push(isProcessing ? "/ai-processing" : "/job-status");
              }}
              style={styles.sessionCard}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.locName, { color: theme.text }]}>
                    {session.location}
                  </Text>
                  <Text style={[styles.dateTime, { color: theme.textMuted }]}>
                    {session.date}, {session.time} · Coverage:{" "}
                    {session.coverage}%
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    isCompleted && {
                      backgroundColor: theme.successSoft,
                      borderColor: theme.success,
                    },
                    isProcessing && {
                      backgroundColor: theme.warningSoft,
                      borderColor: theme.warning,
                    },
                    isFailed && {
                      backgroundColor: theme.dangerSoft,
                      borderColor: theme.danger,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isCompleted && { color: theme.success },
                      isProcessing && { color: theme.warning },
                      isFailed && { color: theme.danger },
                    ]}
                  >
                    {session.status}
                  </Text>
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      <Pressable
        onPress={() => router.push("/select-location")}
        style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
      >
        <AppIcon name="plus" size={18} color="#ffffff" />
        <Text style={styles.btnText}>New Scan</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: { flex: 1, fontSize: 13 },
  sessionCard: { padding: 14, marginBottom: 0 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locName: { fontSize: 14, fontWeight: "800" },
  dateTime: { fontSize: 11, marginTop: 2 },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 11, fontWeight: "800" },
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
