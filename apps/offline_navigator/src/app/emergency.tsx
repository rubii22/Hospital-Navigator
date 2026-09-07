<<<<<<< HEAD
import React from "react";
import { View, Pressable, Text, Linking } from "react-native";
import { BlurView } from "expo-blur";
=======
import { View, Pressable, Text, Linking } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { Heading } from "@/components/ui/heading";
import type { EmergencyContact } from "@/types/navigator.types";

export default function Emergency() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
<<<<<<< HEAD
  const { hospital, emergencyContacts } = useAppContext();

  const handleDial = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const defaultOptions: [AppIconName, string, string][] = [
    ["ambulance", "Call Emergency Ambulance", "911"],
    ["phone", `Call ${hospital?.name || "Hospital"} Reception`, hospital?.phone || "+1 800 555 0199"],
    ["emergency", "Emergency Triage Desk", "+1 800 555 0190"],
  ];

  return (
    <View>
      <Heading
        tag="IMMEDIATE ASSISTANCE"
        title="Emergency Contacts"
        body="Tap any contact below to connect immediately or navigate to the nearest ER triage."
      />

      {/* Backend Real Emergency Contacts */}
      {emergencyContacts && emergencyContacts.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={s.section}>HOSPITAL DIRECT HOTLINES</Text>
          {emergencyContacts.map((contact: EmergencyContact) => (
            <Pressable key={contact.id} onPress={() => handleDial(contact.phone_number)}>
              <BlurView intensity={40} tint={theme.glassTint} style={s.emergency}>
                <View style={s.emergencyContent}>
                  <AppIcon name="phone" color={theme.danger} size={22} />
                  <View>
                    <Text style={s.rowTitle}>{contact.title}</Text>
                    <Text style={s.small}>{contact.phone_number}</Text>
                  </View>
                </View>
                <Text style={{ color: theme.danger, fontWeight: "800", fontSize: 13 }}>CALL NOW ›</Text>
              </BlurView>
            </Pressable>
          ))}
        </View>
      )}

      {/* General Quick Response Numbers */}
      <Text style={s.section}>RAPID RESPONSE SERVICES</Text>
      {defaultOptions.map(([icon, label, phone]) => (
        <Pressable key={label} onPress={() => handleDial(phone)}>
          <BlurView intensity={40} tint={theme.glassTint} style={s.emergency}>
            <View style={s.emergencyContent}>
              <AppIcon name={icon} color={theme.danger} size={22} />
              <View>
                <Text style={s.rowTitle}>{label}</Text>
                <Text style={s.small}>{phone}</Text>
              </View>
            </View>
            <Text style={{ color: theme.danger, fontWeight: "800", fontSize: 13 }}>CALL ›</Text>
          </BlurView>
        </Pressable>
      ))}
=======
  const { emergencyContacts, hospital, destinations, setDestination } = useAppContext();

  const handleContactPress = (phone: string, title: string) => {
    if (title.toLowerCase().includes("emergency room") || title.toLowerCase().includes("triage")) {
      const er = destinations.find((d) => d.name.toLowerCase().includes("emergency") || d.category === "Service");
      if (er) {
        setDestination(er);
        router.push("/route");
        return;
      }
    }

    const cleanNumber = phone.replace(/[^0-9+]/g, "");
    if (cleanNumber) {
      Linking.openURL(`tel:${cleanNumber}`).catch((err) =>
        console.warn("Could not open dialer:", err)
      );
    }
  };

  return (
    <View>
      <Heading
        tag={hospital ? hospital.name.toUpperCase() : "IMMEDIATE HELP"}
        title="Emergency Assistance"
        body="Select an option below to connect with emergency personnel."
      />
      {emergencyContacts.map((contact) => {
        const iconName: AppIconName =
          contact.icon === "ambulance"
            ? "ambulance"
            : contact.icon === "location"
            ? "location"
            : "phone";

        return (
          <Pressable
            key={contact.id}
            onPress={() => handleContactPress(contact.phone_number, contact.title)}
          >
            <BlurView intensity={40} tint={theme.glassTint} style={s.emergency}>
              <View style={s.emergencyContent}>
                <AppIcon name={iconName} color={theme.danger} />
                <View style={s.flex}>
                  <Text style={s.rowTitle}>{contact.title}</Text>
                  <Text style={s.small}>{contact.phone_number}</Text>
                </View>
              </View>
              <Text style={s.arrow}>›</Text>
            </BlurView>
          </Pressable>
        );
      })}
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
    </View>
  );
}
