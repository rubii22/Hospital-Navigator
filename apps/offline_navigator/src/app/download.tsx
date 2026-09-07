import React from "react";
<<<<<<< HEAD
import { View, Text, ActivityIndicator } from "react-native";
=======
import { View, Text, StyleSheet, Pressable } from "react-native";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { AppButton } from "@/components/ui/app-button";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Chips } from "@/components/ui/chips";
import { AppIcon } from "@/components/ui/app-icon";

export default function Download() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
  const {
    hospital,
<<<<<<< HEAD
    hospitalPackage,
    floors,
    downloadMap,
    isDownloadingMap,
    downloadProgress,
    downloadedHospitalIds,
  } = useAppContext();

  if (!hospital) {
    return null;
  }

  const isDownloaded = downloadedHospitalIds.includes(Number(hospital.id));
  const floorLabels = floors.length > 0 ? floors.map((f) => f.name || `Floor ${f.floor_number}`) : ["Ground Floor", "Floor 1", "Floor 2"];

  const handleDownload = async () => {
    await downloadMap(hospital.id);
    router.push("/dashboard");
=======
    bootstrapData,
    downloadMap,
    isDownloading,
    offlinePackage,
    isOfflineMode,
    setIsOfflineMode,
  } = useAppContext();

  if (!hospital) {
    return (
      <View style={{ gap: 16, padding: 20, alignItems: "center" }}>
        <Heading tag="NAVIGATION" title="No Hospital Selected" />
        <AppButton
          label="Choose Hospital"
          onPress={() => router.push("/hospital")}
        />
      </View>
    );
  }

  const mapPkg = bootstrapData?.map_package || {
    version: "1.2.0",
    size: "2.4 MB",
    updated: "Latest",
    floors_count: hospital.floors?.length || 4,
    nodes_count: 44,
    edges_count: 58,
    download_url: "",
  };

  const availableFloors =
    hospital.floors && hospital.floors.length > 0
      ? hospital.floors
      : ["Ground Floor", "Floor 1", "Floor 2", "Floor 3"];

  const handleDownload = async () => {
    const success = await downloadMap();
    if (success) {
      router.push("/dashboard");
    }
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
  };

  return (
    <View style={{ gap: 14 }}>
      <Heading
        tag={hospital.name.toUpperCase()}
<<<<<<< HEAD
        title="Offline Map Download"
        body="Download navigation graphs and floor layouts once to navigate without an internet connection."
      />

      <Card>
        <Text style={s.rowTitle}>Map Version {hospitalPackage?.mapMetadata.version || "1.0.0"}</Text>
        <Text style={s.small}>
          Package Size: {hospitalPackage?.mapMetadata.size || "14.2 MB"} · Updated: {hospitalPackage?.mapMetadata.updated || "Recent"}
        </Text>
        <View style={s.line} />
        <Text style={s.rowTitle}>Included Data</Text>
        <Text style={s.small}>
          ✓ {hospitalPackage?.departments.length || 6} Departments & Clinics{`\n`}
          ✓ {hospitalPackage?.rooms.length || 12} Rooms & POIs{`\n`}
          ✓ {hospitalPackage?.emergencyContacts.length || 3} Emergency Contacts{`\n`}
          ✓ Full Turn-by-Turn Indoor Routing Graph
        </Text>
      </Card>

      {isDownloadingMap ? (
        <Card style={{ alignItems: "center", paddingVertical: 16 }}>
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={[s.rowTitle, { marginTop: 10 }]}>Downloading Map Data... {downloadProgress}%</Text>
          <Text style={s.small}>Saving offline floor plans & nodes to device</Text>
        </Card>
      ) : (
        <AppButton
          label={isDownloaded ? "Map Ready · Open Dashboard" : "Download Map for Offline Use"}
          onPress={handleDownload}
        />
      )}

      <Text style={s.section}>AVAILABLE FLOORS ({floorLabels.length})</Text>
      <Chips values={floorLabels} />
=======
        title="Offline Map Package"
        body="Download the complete spatial graph to navigate without an internet connection."
      />

      {/* Package Status Card */}
      <Card>
        <View style={localStyles.pkgHeader}>
          <View>
            <Text style={s.rowTitle}>NavPack v{mapPkg.version}</Text>
            <Text style={s.small}>
              Updated {mapPkg.updated} · {mapPkg.size}
            </Text>
          </View>
          <View
            style={[
              localStyles.statusBadge,
              offlinePackage
                ? {
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    borderColor: theme.success,
                  }
                : {
                    backgroundColor: "rgba(56, 189, 248, 0.15)",
                    borderColor: theme.primary,
                  },
            ]}
          >
            <Text
              style={[
                localStyles.statusBadgeText,
                { color: offlinePackage ? theme.success : theme.primary },
              ]}
            >
              {offlinePackage ? "CACHED" : "AVAILABLE"}
            </Text>
          </View>
        </View>

        <View style={s.line} />

        <View style={localStyles.statsGrid}>
          <View style={localStyles.statCol}>
            <Text style={localStyles.statVal}>{mapPkg.floors_count}</Text>
            <Text style={localStyles.statLabel}>Mapped Floors</Text>
          </View>
          <View style={localStyles.statCol}>
            <Text style={localStyles.statVal}>
              {bootstrapData?.destinations?.length || 21}
            </Text>
            <Text style={localStyles.statLabel}>Destinations</Text>
          </View>
          <View style={localStyles.statCol}>
            <Text style={localStyles.statVal}>{mapPkg.nodes_count}</Text>
            <Text style={localStyles.statLabel}>Nav Nodes</Text>
          </View>
        </View>
      </Card>

      {/* Download Action */}
      <AppButton
        label={
          isDownloading
            ? "Downloading vector map package…"
            : offlinePackage
              ? "Update Offline Package"
              : "Download Map Package"
        }
        disabled={isDownloading}
        onPress={handleDownload}
      />

      {/* Offline Mode Toggle Card */}
      <Card>
        <View style={localStyles.offlineToggleRow}>
          <View style={s.flex}>
            <Text style={s.rowTitle}>Offline Simulation Mode</Text>
            <Text style={s.small}>
              {isOfflineMode
                ? "Navigating strictly from local vector cache"
                : "Live connected to backend API"}
            </Text>
          </View>
          <Pressable
            onPress={() => setIsOfflineMode(!isOfflineMode)}
            style={[
              localStyles.toggleSwitch,
              {
                backgroundColor: isOfflineMode
                  ? "#f59e0b"
                  : "rgba(255, 255, 255, 0.15)",
              },
            ]}
          >
            <View
              style={[
                localStyles.toggleThumb,
                isOfflineMode
                  ? { alignSelf: "flex-end" }
                  : { alignSelf: "flex-start" },
              ]}
            />
          </Pressable>
        </View>
      </Card>

      {/* Available Floors List */}
      <View style={{ gap: 6 }}>
        <Text style={s.section}>INCLUDED FLOOR MAPS</Text>
        <Chips values={availableFloors} />
      </View>
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
    </View>
  );
}

const localStyles = StyleSheet.create({
  pkgHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  statCol: {
    alignItems: "center",
    flex: 1,
  },
  statVal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#38bdf8",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94a3b8",
    marginTop: 2,
  },
  offlineToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ffffff",
  },
});
