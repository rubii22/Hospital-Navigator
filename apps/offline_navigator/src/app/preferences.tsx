import React from "react";
import { View, Switch, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useAppContext } from "@/context/AppContext";
import { createStyles } from "@/styles/shared.styles";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";

export default function Preferences() {
  const theme = useTheme();
  const s = createStyles(theme);
  const { preferences, updatePreferences } = useAppContext();

  const options = [
    {
      key: "wheelchair" as const,
      title: "Wheelchair Accessible",
      description: "Routes using ramps, wide double doors, and step-free paths",
      icon: "accessibility" as const,
    },
    {
      key: "noStairs" as const,
      title: "Avoid All Stairs",
      description: "Exclusively navigates using ground level and elevator paths",
      icon: "hospital" as const,
    },
    {
      key: "nearestElevator" as const,
      title: "Prioritize Elevators",
      description: "Routes multi-floor transfers through the nearest operational elevator",
      icon: "room" as const,
    },
    {
      key: "voiceGuidance" as const,
      title: "Voice Audio Turn Prompts",
      description: "Spoken audio guidance at every intersection and floor change",
      icon: "services" as const,
    },
    {
      key: "highContrast" as const,
      title: "High Contrast Map",
      description: "High visibility text and bold corridor lines for low-vision navigation",
      icon: "radiology" as const,
    },
  ];

  return (
    <View>
      <Heading
        tag="ACCESSIBILITY"
        title="Route Preferences"
        body="Customize your navigation routes to suit your mobility and accessibility needs."
      />

      {options.map((opt) => (
        <Card key={opt.key} style={s.setting}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <AppIcon name={opt.icon} size={18} color={theme.primary} />
              <Text style={s.rowTitle}>{opt.title}</Text>
            </View>
            <Text style={s.small}>{opt.description}</Text>
          </View>

          <Switch
            value={Boolean(preferences[opt.key])}
            onValueChange={(val) => updatePreferences({ [opt.key]: val })}
            thumbColor={theme.text}
            trackColor={{ false: theme.surfaceMuted, true: theme.primary }}
          />
        </Card>
      ))}
    </View>
  );
}
