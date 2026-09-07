<<<<<<< HEAD
import React from "react";
import { View, Text } from "react-native";
=======
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { AppButton } from "@/components/ui/app-button";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
<<<<<<< HEAD
=======
import { LiveMapCanvas } from "@/components/ui/live-map-canvas";
import { MapDirectionsView } from "@/components/ui/map-directions-view";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688

export default function Route() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
<<<<<<< HEAD
  const { destination, userLocation, preferences } = useAppContext();

  if (!destination) {
    return (
      <View>
        <Heading title="No Destination Selected" body="Please select a destination first to preview your route." />
        <AppButton label="Go to Search" onPress={() => router.push("/search")} />
=======
  const { destination, hospital, currentFloorMap } = useAppContext();
  const [mapMode, setMapMode] = useState<"indoor" | "gps">("indoor");

  if (!destination) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <Heading tag="ROUTE PREVIEW" title="No Destination Selected" />
        <AppButton
          label="Find Destination"
          onPress={() => router.push("/search")}
        />
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
      </View>
    );
  }

<<<<<<< HEAD
  const estimatedMinutes = preferences.wheelchair ? 4 : 3;
  const estimatedMeters = 240;

  return (
    <View>
      <Heading tag="ROUTE PREVIEW" title="Indoor Route Ready" body="Turn-by-turn navigation calculated using offline spatial graph." />

      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <AppIcon name="location" size={16} color={theme.primary} />
          <Text style={s.tag}>STARTING POINT</Text>
        </View>
        <Text style={s.rowTitle}>{userLocation.name}</Text>
        <Text style={s.small}>{userLocation.detail}</Text>

        <View style={s.line} />

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <AppIcon name="route" size={16} color={theme.primary} />
          <Text style={s.tag}>DESTINATION</Text>
        </View>
        <Text style={s.rowTitle}>{destination.name}</Text>
        <Text style={s.small}>{destination.detail}</Text>
      </Card>

      <Card style={s.best} blur={60}>
        <Text style={s.rowTitle}>
          {preferences.wheelchair ? "Accessible Route (Wheelchair & Elevators)" : "Fastest Direct Route"}
        </Text>
        <Text style={s.metric}>{estimatedMinutes} min · {estimatedMeters} m</Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
          {preferences.noStairs && (
            <Text style={s.ok}>✓ No stairs</Text>
          )}
          {preferences.wheelchair && (
            <Text style={s.ok}>✓ Wide corridors</Text>
          )}
          <Text style={s.ok}>✓ Step-by-step guidance</Text>
        </View>
      </Card>

      <AppButton label="Start Live Navigation" onPress={() => router.push("/live")} />
      <AppButton
        label="Change Route Preferences"
        variant="secondary"
        style={s.top}
        onPress={() => router.push("/preferences")}
=======
  const floorTag = destination.floor_name || "Ground Floor";
  const buildingTag = destination.building_name || "Main Complex";

  return (
    <View style={{ gap: 12 }}>
      <Heading
        tag={hospital ? hospital.name.toUpperCase() : "ROUTE PREVIEW"}
        title="Ready to navigate?"
      />

      {/* Origin & Destination Card */}
      <Card>
        <View style={localStyles.endpointRow}>
          <View style={[localStyles.dot, { backgroundColor: "#38bdf8" }]} />
          <View style={s.flex}>
            <Text style={s.tag}>ORIGIN</Text>
            <Text style={s.rowTitle}>Entrance QR Localization Anchor</Text>
            <Text style={s.small}>
              {floorTag} · {buildingTag}
            </Text>
          </View>
        </View>

        <View style={localStyles.connectorLine} />

        <View style={localStyles.endpointRow}>
          <View style={[localStyles.dot, { backgroundColor: theme.success }]} />
          <View style={s.flex}>
            <Text style={s.tag}>DESTINATION</Text>
            <Text style={s.rowTitle}>{destination.name}</Text>
            <Text style={s.small}>
              {destination.detail}{" "}
              {destination.room_number
                ? `· Room #${destination.room_number}`
                : ""}
            </Text>
          </View>
        </View>
      </Card>

      {/* Map Mode Switcher */}
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
            size={14}
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
            size={14}
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

      {/* Map Canvas Preview (Toggle between Indoor Vector Map & React Native Map Directions) */}
      <View style={{ borderRadius: 16, overflow: "hidden" }}>
        {mapMode === "indoor" ? (
          <LiveMapCanvas
            floorMap={currentFloorMap}
            destination={destination}
            progressPercent={0}
            height={220}
          />
        ) : (
          <MapDirectionsView
            hospital={hospital}
            destination={destination}
            height={220}
          />
        )}
      </View>

      {/* Route Accessibility Metric */}
      <Card style={s.best} blur={60}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={s.rowTitle}>Direct Accessible Route</Text>
            <Text style={s.metric}>~2 min · 95 m</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <AppIcon name="check" size={16} color={theme.success} />
            <Text style={s.ok}>No stairs · Elevators ready</Text>
          </View>
        </View>
      </Card>

      <AppButton
        label="Start Navigation"
        onPress={() => router.push("/live")}
      />
      <AppButton
        label="Change Destination"
        variant="secondary"
        onPress={() => router.push("/search")}
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  endpointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  connectorLine: {
    width: 2,
    height: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginLeft: 5,
    marginVertical: 2,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
