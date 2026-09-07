<<<<<<< HEAD
import React, { useState } from "react";
import { View, Text, Linking, Pressable } from "react-native";
=======
import React from "react";
import { View, Text, StyleSheet } from "react-native";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";

export default function Detail() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
<<<<<<< HEAD
  const { destination, hospital } = useAppContext();
  const [isFavorite, setIsFavorite] = useState(false);

  if (!destination) {
    return (
      <View>
        <Heading title="No Destination Selected" body="Please select a department or room to view details." />
        <AppButton label="Go to Search" onPress={() => router.push("/search")} />
=======
  const { destination, facilities } = useAppContext();

  if (!destination) {
    return (
      <View style={{ gap: 16, padding: 20, alignItems: "center" }}>
        <Heading tag="DESTINATION" title="No Destination Selected" />
        <AppButton
          label="Search Destinations"
          onPress={() => router.push("/search")}
        />
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
      </View>
    );
  }

<<<<<<< HEAD
  const handleCall = () => {
    if (destination.phone) {
      Linking.openURL(`tel:${destination.phone}`);
    } else if (hospital?.phone) {
      Linking.openURL(`tel:${hospital.phone}`);
    }
  };

  return (
    <View>
      <Heading tag={destination.category.toUpperCase()} title={destination.name} />

      <Card style={[s.photo, { gap: 8 }]} blur={10}>
        <AppIcon
          name={destination.category === "Department" ? "department" : destination.category === "Room" ? "room" : "services"}
          size={50}
          color={theme.primary}
        />
        <Text style={[s.rowTitle, { textAlign: "center" }]}>{destination.detail}</Text>
        <Text style={s.small}>{hospital?.name || "Hospital Main Campus"}</Text>
      </Card>

      <Text style={[s.body, { marginVertical: 12 }]}>
        Full indoor routing with step-by-step guidance is ready for this location.
      </Text>

      {destination.phone && (
        <Pressable onPress={handleCall}>
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <AppIcon name="phone" size={20} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>Department Direct Line</Text>
              <Text style={s.small}>{destination.phone}</Text>
            </View>
            <Text style={{ color: theme.primary, fontWeight: "700", fontSize: 12 }}>CALL</Text>
          </Card>
        </Pressable>
      )}

      <Text style={s.section}>FACILITIES & ACCESSIBILITY</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {["Wheelchair Route", "Elevator Access", "Restrooms Nearby", "Emergency Exit"].map((f) => (
          <View key={f} style={{ backgroundColor: theme.surfaceRaised, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <AppIcon name="check" size={14} color={theme.success} />
            <Text style={{ color: theme.text, fontSize: 12, fontWeight: "600" }}>{f}</Text>
=======
  const floorTag = destination.floor_name || "Ground Floor";
  const buildingTag = destination.building_name || "Main Hospital";

  return (
    <View style={{ gap: 14 }}>
      <Heading
        tag={destination.category.toUpperCase()}
        title={destination.name}
      />

      {/* Main Destination Card */}
      <Card>
        <View style={localStyles.cardHeader}>
          <View
            style={[
              localStyles.iconWrap,
              { backgroundColor: theme.primarySoft },
            ]}
          >
            <AppIcon
              name={
                destination.category === "Department" ? "department" : "room"
              }
              size={28}
              color={theme.primary}
            />
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
          </View>
          <View style={s.flex}>
            <Text style={s.rowTitle}>{destination.name}</Text>
            <Text style={s.small}>
              {floorTag} · {buildingTag}
            </Text>
            {destination.room_number ? (
              <Text style={localStyles.roomNumberBadge}>
                Room #{destination.room_number}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={s.line} />

        <View style={localStyles.detailRow}>
          <View style={localStyles.metaCol}>
            <Text style={localStyles.metaLabel}>LOCATION</Text>
            <Text style={localStyles.metaVal}>{floorTag}</Text>
          </View>
          <View style={localStyles.metaCol}>
            <Text style={localStyles.metaLabel}>BUILDING</Text>
            <Text style={localStyles.metaVal}>{buildingTag}</Text>
          </View>
          <View style={localStyles.metaCol}>
            <Text style={localStyles.metaLabel}>TYPE</Text>
            <Text style={localStyles.metaVal}>{destination.category}</Text>
          </View>
        </View>
      </Card>

      {/* Accessibility & Features */}
      <View style={{ gap: 8 }}>
        <Text style={s.section}>FACILITIES & ACCESSIBILITY</Text>
        <Card>
          <View style={localStyles.facilityList}>
            {facilities.map((f: string) => (
              <View key={f} style={localStyles.facilityItem}>
                <AppIcon name="check" size={14} color={theme.success} />
                <Text style={localStyles.facilityText}>{f}</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

<<<<<<< HEAD
      <AppButton label="Start Route Preview" onPress={() => router.push("/route")} />
      
      <AppButton
        label={isFavorite ? "✓ Saved in Favourites" : "Add to Favourites"}
        variant="secondary"
        style={s.top}
        onPress={() => setIsFavorite(!isFavorite)}
=======
      {/* Action Buttons */}
      <AppButton
        label="Start Navigation Route"
        onPress={() => router.push("/route")}
      />
      <AppButton
        label="Back to Directory"
        variant="secondary"
        onPress={() => router.push("/search")}
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  roomNumberBadge: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    marginTop: 2,
  },
  facilityList: {
    gap: 8,
  },
  facilityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  facilityText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },
});
