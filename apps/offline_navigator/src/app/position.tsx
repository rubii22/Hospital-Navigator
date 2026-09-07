import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { Heading } from "@/components/ui/heading";

export default function Position() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
  const { userLocation, destination } = useAppContext();

  return (
    <View style={s.center}>
      <View style={s.check}>
        <AppIcon name="check" size={40} color={theme.success} />
      </View>
      <Heading tag="INDOOR GPS ANCHOR" title="Position Confirmed!" />
      <Text style={s.metric}>{userLocation.name}</Text>
      <Text style={s.body}>{userLocation.detail}</Text>

      <View style={{ width: "100%", gap: 12, marginTop: 16 }}>
        <AppButton
          label={destination ? `Route to ${destination.name}` : "Select Destination"}
          onPress={() => router.push(destination ? "/route" : "/search")}
        />
        <AppButton label="Scan Different QR" variant="secondary" onPress={() => router.push("/qr")} />
      </View>
    </View>
  );
}
