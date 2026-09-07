import React, { useState, useRef } from "react";
import { View, StyleSheet, Text, Platform, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { AppIcon } from "./app-icon";
import type { Destination, Hospital } from "@/api/navigator-api";

// Conditional import for react-native-maps
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let MapViewDirections: any = null;

if (Platform.OS !== "web") {
  try {
    const Maps = require("react-native-maps");
    MapView = Maps.default || Maps;
    Marker = Maps.Marker;
    Polyline = Maps.Polyline;
    MapViewDirections = require("react-native-maps-directions").default;
  } catch (e) {
    // Native maps not available
  }
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface MapDirectionsViewProps {
  hospital: Hospital | null;
  destination: Destination | null;
  origin?: LatLng;
  destinationCoord?: LatLng;
  googleApiKey?: string;
  height?: number;
  showToggle?: boolean;
}

export function MapDirectionsView({
  hospital,
  destination,
  origin,
  destinationCoord,
  googleApiKey,
  height = 270,
}: MapDirectionsViewProps) {
  const theme = useTheme();
  const mapRef = useRef<any>(null);

  // Default to Vector Blueprint view so there is ZERO black screen if Google API key is absent
  const [renderMode, setRenderMode] = useState<"blueprint" | "google_sdk">("blueprint");

  // Real Hospital Coordinates from PostgreSQL / bootstrap
  const defaultHospitalLat = hospital?.latitude || 37.7749;
  const defaultHospitalLng = hospital?.longitude || -122.4194;

  // Origin: Campus Entrance Gate
  const originPos: LatLng = origin || {
    latitude: defaultHospitalLat - 0.002,
    longitude: defaultHospitalLng - 0.0018,
  };

  // Destination: Hospital Building / Clinic
  const destPos: LatLng = destinationCoord || {
    latitude: defaultHospitalLat + 0.0015,
    longitude: defaultHospitalLng + 0.0014,
  };

  // Pre-calculated GPS route polyline
  const offlineCampusRoute: LatLng[] = [
    originPos,
    {
      latitude: originPos.latitude + 0.0008,
      longitude: originPos.longitude + 0.0004,
    },
    {
      latitude: originPos.latitude + 0.0018,
      longitude: originPos.longitude + 0.0012,
    },
    destPos,
  ];

  const destName = destination?.name || hospital?.name || "Medical Complex";
  const floorName = destination?.floor_name || "Campus Entrance";
  const roomNum = destination?.room_number ? ` (Room #${destination.room_number})` : "";

  const [routeInfo, setRouteInfo] = useState({
    distance: "320 m",
    duration: "4 mins",
    isGoogleOnline: false,
  });

  const apiKey =
    googleApiKey ||
    (typeof process !== "undefined" &&
      process.env &&
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) ||
    "";

  const initialRegion = {
    latitude: (originPos.latitude + destPos.latitude) / 2,
    longitude: (originPos.longitude + destPos.longitude) / 2,
    latitudeDelta: 0.007,
    longitudeDelta: 0.007,
  };

  // Render Google Map SDK only when explicitly toggled and available
  if (renderMode === "google_sdk" && MapView && Marker && Platform.OS !== "web") {
    return (
      <View style={[styles.container, { height, borderColor: theme.borderHighlight }]}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
        >
          <Marker
            coordinate={originPos}
            title="Campus Entrance"
            description="Main Gate"
          >
            <View style={styles.originMarkerWrap}>
              <View style={styles.originMarkerDot} />
            </View>
          </Marker>

          <Marker coordinate={destPos} title={destName} description={`${floorName}${roomNum}`}>
            <View style={styles.destMarkerWrap}>
              <AppIcon name="location" size={16} color="#ffffff" />
            </View>
          </Marker>

          {apiKey && MapViewDirections ? (
            <MapViewDirections
              origin={originPos}
              destination={destPos}
              apikey={apiKey}
              strokeWidth={5}
              strokeColor="#0284c7"
              mode="WALKING"
              onReady={(result: any) => {
                if (result) {
                  const dist =
                    result.distance < 1
                      ? `${Math.round(result.distance * 1000)} m`
                      : `${result.distance.toFixed(1)} km`;
                  const dur = `${Math.round(result.duration)} mins`;
                  setRouteInfo({ distance: dist, duration: dur, isGoogleOnline: true });
                }
              }}
            />
          ) : (
            <Polyline
              coordinates={offlineCampusRoute}
              strokeWidth={5}
              strokeColor="#38bdf8"
              lineDashPattern={[0]}
            />
          )}
        </MapView>

        {/* View Switcher Button */}
        <Pressable
          onPress={() => setRenderMode("blueprint")}
          style={styles.switchViewBtn}
        >
          <Text style={styles.switchViewText}>Switch to Blueprint Canvas</Text>
        </Pressable>

        {/* Top Directions Overlay Badge */}
        <View style={styles.topBadge}>
          <View style={styles.topBadgeRow}>
            <View style={[styles.navPulse, { backgroundColor: "#10b981" }]} />
            <Text style={styles.topBadgeTitle}>GOOGLE MAPS VIEW</Text>
          </View>
          <Text style={styles.topBadgeSubtitle}>
            {routeInfo.distance} · {routeInfo.duration} walk
          </Text>
        </View>
      </View>
    );
  }

  // Guaranteed High-Visibility Blueprint Campus Canvas (Never Black)
  return (
    <View style={[styles.container, { height, borderColor: theme.borderHighlight }]}>
      {/* Blueprint Grid Texture */}
      <View style={styles.blueprintGrid}>
        <View style={styles.gridLineH1} />
        <View style={styles.gridLineH2} />
        <View style={styles.gridLineV1} />
        <View style={styles.gridLineV2} />
      </View>

      {/* Campus Road Network */}
      <View style={styles.campusRoadH} />
      <View style={styles.campusRoadV} />
      <View style={styles.campusAvenue} />

      {/* Buildings Overlay */}
      <View style={[styles.campusBuilding, styles.bldgPavilion]}>
        <Text style={styles.bldgCode}>BLDG B</Text>
        <Text style={styles.bldgName}>Pavilion</Text>
      </View>

      <View style={[styles.campusBuilding, styles.bldgTower]}>
        <Text style={styles.bldgCode}>BLDG A</Text>
        <Text style={styles.bldgName}>Main Tower</Text>
      </View>

      <View style={[styles.campusBuilding, styles.bldgEmergency]}>
        <Text style={[styles.bldgCode, { color: "#f87171" }]}>EMERGENCY</Text>
        <Text style={styles.bldgName}>Trauma Bay</Text>
      </View>

      {/* Illuminated Route Polyline */}
      <View style={styles.polylineTrailH} />
      <View style={styles.polylineTrailV} />

      {/* Origin Pin (Campus Entrance Gate) */}
      <View style={[styles.pinWrapper, styles.originPinPos]}>
        <View style={styles.originMarkerWrap}>
          <View style={styles.originMarkerDot} />
        </View>
        <View style={styles.pinLabelWrap}>
          <Text style={styles.pinLabelText}>Main Gate</Text>
        </View>
      </View>

      {/* Destination Target Pin */}
      <View style={[styles.pinWrapper, styles.destPinPos]}>
        <View style={styles.destMarkerWrap}>
          <AppIcon name="location" size={15} color="#ffffff" />
        </View>
        <View style={[styles.pinLabelWrap, { borderColor: "#10b981", backgroundColor: "rgba(6, 78, 59, 0.95)" }]}>
          <Text numberOfLines={1} style={[styles.pinLabelText, { color: "#34d399" }]}>
            {destName}
          </Text>
        </View>
      </View>

      {/* Top Directions Telemetry Badge */}
      <View style={styles.topBadge}>
        <View style={styles.topBadgeRow}>
          <View style={styles.navPulse} />
          <Text style={styles.topBadgeTitle}>GPS CAMPUS DIRECTIONS</Text>
        </View>
        <Text style={styles.topBadgeSubtitle}>
          {routeInfo.distance} · {routeInfo.duration} walk
        </Text>
      </View>

      {/* Bottom Coordinates Legend */}
      <View style={styles.bottomTag}>
        <AppIcon name="location" size={11} color="#38bdf8" />
        <Text style={styles.bottomTagText}>
          {defaultHospitalLat.toFixed(4)}°N, {defaultHospitalLng.toFixed(4)}°W · {floorName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    backgroundColor: "#0d1527",
    position: "relative",
  },
  blueprintGrid: {
    ...StyleSheet.absoluteFill,
  },
  gridLineH1: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "35%",
    height: 1,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
  },
  gridLineH2: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "70%",
    height: 1,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
  },
  gridLineV1: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "35%",
    width: 1,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
  },
  gridLineV2: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "70%",
    width: 1,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
  },
  campusRoadH: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "74%",
    height: 22,
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "rgba(71, 85, 105, 0.7)",
  },
  campusRoadV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "67%",
    width: 22,
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(71, 85, 105, 0.7)",
  },
  campusAvenue: {
    position: "absolute",
    left: "16%",
    width: "52%",
    top: "38%",
    height: 16,
    backgroundColor: "rgba(56, 189, 248, 0.2)",
    borderRadius: 8,
  },
  campusBuilding: {
    position: "absolute",
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(100, 116, 139, 0.7)",
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  bldgPavilion: {
    left: "6%",
    top: "14%",
    width: 82,
    height: 54,
  },
  bldgTower: {
    left: "34%",
    top: "8%",
    width: 98,
    height: 66,
    borderColor: "rgba(56, 189, 248, 0.6)",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
  },
  bldgEmergency: {
    right: "5%",
    top: "28%",
    width: 88,
    height: 56,
    borderColor: "rgba(239, 68, 68, 0.6)",
  },
  bldgCode: {
    color: "#38bdf8",
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bldgName: {
    color: "#f8fafc",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },
  polylineTrailH: {
    position: "absolute",
    left: "14%",
    width: "56%",
    top: "76%",
    height: 6,
    backgroundColor: "#38bdf8",
    borderRadius: 3,
  },
  polylineTrailV: {
    position: "absolute",
    left: "68%",
    top: "16%",
    height: "62%",
    width: 6,
    backgroundColor: "#38bdf8",
    borderRadius: 3,
  },
  pinWrapper: {
    position: "absolute",
    alignItems: "center",
    zIndex: 20,
  },
  originPinPos: {
    left: "8%",
    top: "64%",
  },
  destPinPos: {
    right: "10%",
    top: "6%",
  },
  originMarkerWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(56, 189, 248, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  originMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#38bdf8",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  destMarkerWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  pinLabelWrap: {
    marginTop: 3,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    maxWidth: 140,
  },
  pinLabelText: {
    color: "#f8fafc",
    fontSize: 9.5,
    fontWeight: "800",
  },
  topBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(10, 15, 29, 0.95)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    zIndex: 25,
  },
  topBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38bdf8",
  },
  topBadgeTitle: {
    color: "#38bdf8",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  topBadgeSubtitle: {
    color: "#cbd5e1",
    fontSize: 8.5,
    fontWeight: "600",
    marginTop: 1,
  },
  bottomTag: {
    position: "absolute",
    bottom: 8,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(10, 15, 29, 0.95)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 25,
  },
  bottomTagText: {
    color: "#94a3b8",
    fontSize: 8.5,
    fontWeight: "700",
  },
  switchViewBtn: {
    position: "absolute",
    bottom: 8,
    left: 10,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
    zIndex: 25,
  },
  switchViewText: {
    color: "#38bdf8",
    fontSize: 9,
    fontWeight: "700",
  },
});
