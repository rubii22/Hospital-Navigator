import React, { useState } from "react";
import { View, Pressable, Text, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";

export default function Qr() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
  const { setUserLocation } = useAppContext();

  const [manualCode, setManualCode] = useState("");

  const presetAnchors = [
    { label: "Main Entrance QR (Ground Floor)", name: "Main Entrance", detail: "Ground Floor · Building A", floorNumber: 0, nodeId: "n1" },
    { label: "Elevator Lobby A (Floor 1)", name: "Elevator Lobby A", detail: "Floor 1 · Building A", floorNumber: 1, nodeId: "n6" },
    { label: "Radiology Waiting QR (Floor 1)", name: "Radiology Waiting Area", detail: "Floor 1 · Building B", floorNumber: 1, nodeId: "n5" },
  ];

  const handleConfirmLocation = (loc: { name: string; detail: string; floorNumber: number; nodeId: string }) => {
    setUserLocation(loc);
    router.push("/position");
  };

  const handleManualSubmit = () => {
    const code = manualCode.trim() || "QR-ENTRANCE-01";
    setUserLocation({
      name: `QR Anchor: ${code}`,
      detail: "Indoor Spatial Anchor Verified",
      floorNumber: 0,
      nodeId: "n1",
    });
    router.push("/position");
  };

  return (
    <View>
      <Heading tag="INDOOR POSITIONING" title="Scan QR Anchor" body="Locate any physical QR plaque posted on walls or near elevators to set your position." />
      
      <View style={[s.qr, { alignSelf: "center", marginVertical: 16 }]}>
        <AppIcon name="qr" size={100} color={theme.primary} />
        <Text style={[s.small, { textAlign: "center", marginTop: 8 }]}>Align camera with QR Code plaque</Text>
      </View>

      <Text style={s.section}>TEST WITH SAMPLE QR ANCHORS</Text>
      {presetAnchors.map((anchor) => (
        <Pressable key={anchor.name} onPress={() => handleConfirmLocation(anchor)}>
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <AppIcon name="location" size={20} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>{anchor.name}</Text>
              <Text style={s.small}>{anchor.detail}</Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </Card>
        </Pressable>
      ))}

      <Text style={s.section}>OR ENTER CODE MANUALLY</Text>
      <TextInput
        value={manualCode}
        onChangeText={setManualCode}
        placeholder="e.g. QR-ELEVATOR-204"
        placeholderTextColor={theme.textMuted}
        style={s.input}
      />
      <AppButton label="Confirm Manual Code" variant="secondary" onPress={handleManualSubmit} />
    </View>
  );
}
