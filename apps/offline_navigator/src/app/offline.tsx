import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";

export default function Offline() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
  const { hospital, hospitalPackage, downloadedHospitalIds } = useAppContext();

  const features = [
    "Vector Floor Plans & Room Polygons",
    "Turn-by-Turn Offline Routing Graph",
    "QR Indoor Positioning Anchors",
    "Department Search & Emergency Contacts",
  ];

  return (
    <View>
      <Heading tag="OFFLINE MODE" title="Offline Navigator Active" body="All indoor maps and navigation features work 100% without an internet connection." />

      <Card>
        <Text style={s.rowTitle}>{hospital?.name || "Hospital"}</Text>
        <Text style={s.small}>
          {downloadedHospitalIds.includes(Number(hospital?.id))
            ? "✓ Fully cached on local device"
            : "✓ Offline fallback package active"}
        </Text>

        <View style={s.line} />

        {features.map((feature) => (
          <View style={s.okRow} key={feature}>
            <AppIcon name="check" size={16} color={theme.success} />
            <Text style={s.ok}>{feature}</Text>
          </View>
        ))}
      </Card>

      <AppButton label="Continue Offline Navigation" onPress={() => router.push("/dashboard")} />
    </View>
  );
}
