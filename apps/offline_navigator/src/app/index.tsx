import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useAppContext } from "@/context/AppContext";
import { AppIcon } from "@/components/ui/app-icon";
import { AppButton } from "@/components/ui/app-button";

export default function Welcome() {
  const router = useRouter();
  const theme = useTheme();
  const { hospital } = useAppContext();

  const handleStart = () => {
    if (hospital) {
      router.push("/dashboard");
    } else {
      router.push("/hospital");
    }
  };

  return (
    <View style={localStyles.container}>
      <View style={localStyles.content}>
        <View style={[localStyles.heroIconWrap, { backgroundColor: theme.primarySoft }]}>
          <AppIcon name="medical" size={48} color={theme.primary} />
        </View>
        <Text style={[localStyles.title, { color: theme.text }]}>
          Hospital Navigator
        </Text>
        <Text style={[localStyles.subtitle, { color: theme.textMuted }]}>
          Seamless indoor wayfinding and GPS campus directions without cellular reception.
        </Text>
      </View>

      <View style={localStyles.footer}>
        <AppButton
          label={hospital ? `Continue to ${hospital.name.slice(0, 20)}…` : "Get Started"}
          onPress={handleStart}
        />
        <AppButton
          label="Select Medical Campus"
          variant="secondary"
          onPress={() => router.push("/hospital")}
        />
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 40,
    minHeight: 520,
  },
  content: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  heroIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
    maxWidth: 300,
  },
  footer: {
    gap: 12,
    paddingHorizontal: 8,
  },
});
