import React, { useEffect } from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { AppIcon } from "@/components/ui/app-icon";
import { useExtractorContext } from "@/context/ExtractorContext";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { createStyles } from "@/styles/dashboard.styles";
import { Heading } from "@/components/ui/heading";

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuth();
  const {
    hospitals,
    selectedHospitalId,
    setSelectedHospitalId,
    fetchHospitals,
    loading,
  } = useExtractorContext();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleSelectHospital = (id: number, name: string) => {
    setSelectedHospitalId(id);
    router.push("/select-location");
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 260 }}
      style={{ backgroundColor: theme.background, borderRadius: 32 }}
    >
      <View style={styles.container}>
        <View style={styles.watermarkBg}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>

        <Heading
          title={`Welcome,\n${user?.full_name || "Mapper"}`}
          subtitle="Select your hospital to start scanning and mapping floors."
        />

        <Text style={styles.sectionTitle}>
          {hospitals.length > 0
            ? `Your Hospital${hospitals.length > 1 ? "s" : ""}`
            : null}
        </Text>

        <View style={styles.hospitalList}>
          {hospitals.map((hospital) => {
            const isActive = selectedHospitalId === hospital.id;

            return (
              <Pressable
                key={hospital.id}
                onPress={() => handleSelectHospital(hospital.id, hospital.name)}
                style={[
                  styles.hospitalItem,
                  isActive && styles.hospitalItemActive,
                ]}
              >
                <View
                  style={[styles.iconWrap, isActive && styles.iconWrapActive]}
                >
                  <AppIcon
                    name="hospital"
                    size={20}
                    color={isActive ? "#d97706" : "#64748b"}
                  />
                </View>
                <Text
                  style={[
                    styles.hName,
                    isActive && styles.hNameActive,
                    { color: theme.text },
                  ]}
                >
                  {hospital.name}
                </Text>
              </Pressable>
            );
          })}

          {hospitals.length === 0 && !loading && (
            <View style={styles.emptyWrap}>
              <AppIcon name="hospital" size={32} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                No registered hospitals found.
              </Text>
              <Pressable
                onPress={() => router.push("/my-hospitals")}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>Register Hospital</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
