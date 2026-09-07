<<<<<<< HEAD
import React, { useState } from "react";
=======
import { useState } from "react";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
import { View, TextInput, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { AppIcon } from "@/components/ui/app-icon";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
<<<<<<< HEAD
import type { Hospital } from "@/types/navigator.types";
=======
import { Chips } from "@/components/ui/chips";
import type { Hospital } from "@/api/navigator-api";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688

export default function Hospitals() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
<<<<<<< HEAD
  const { hospitals, selectHospital, downloadedHospitalIds } = useAppContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Downloaded" | "Recent">("All");

  const filteredHospitals = hospitals.filter((h: Hospital) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.address && h.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (h.code && h.code.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === "Downloaded") {
      return downloadedHospitalIds.includes(Number(h.id));
    }
    return true;
  });

  const handleSelectHospital = async (h: Hospital) => {
    await selectHospital(h);
    router.push("/download");
  };
=======
  const { hospitals, setHospital } = useAppContext();
  const [filterText, setFilterText] = useState("");

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(filterText.toLowerCase()) ||
    (h.address && h.address.toLowerCase().includes(filterText.toLowerCase()))
  );
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688

  return (
    <View>
      <Heading tag="STEP 1 OF 3" title="Select a hospital" body="Choose a hospital to load navigation maps and floor plans." />
      <TextInput
<<<<<<< HEAD
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search hospitals by name, code, or city…"
=======
        value={filterText}
        onChangeText={setFilterText}
        placeholder="Search hospitals…"
        style={s.input}
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
        placeholderTextColor={theme.textMuted}
        style={s.input}
      />
<<<<<<< HEAD
      <View style={s.chips}>
        {(["All", "Downloaded", "Recent"] as const).map((filter) => (
          <Pressable key={filter} onPress={() => setActiveFilter(filter)}>
            <Text style={activeFilter === filter ? s.chipOn : s.chip}>{filter}</Text>
          </Pressable>
        ))}
      </View>

      {filteredHospitals.length === 0 ? (
        <Card style={{ alignItems: "center", paddingVertical: 24 }}>
          <AppIcon name="search" size={32} color={theme.textMuted} />
          <Text style={[s.rowTitle, { marginTop: 8 }]}>No hospitals found</Text>
          <Text style={s.small}>Try searching with a different name or keyword.</Text>
        </Card>
      ) : (
        filteredHospitals.map((h: Hospital) => {
          const isDownloaded = downloadedHospitalIds.includes(Number(h.id));
          return (
            <Pressable key={String(h.id)} onPress={() => handleSelectHospital(h)}>
              <Card style={s.hospital}>
                <View style={s.building}>
                  <AppIcon name="hospital" size={22} color={theme.primary} />
                </View>
                <View style={s.flex}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={s.rowTitle}>{h.name}</Text>
                    {isDownloaded && (
                      <View style={{ backgroundColor: theme.primarySoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ color: theme.primary, fontSize: 10, fontWeight: "700" }}>OFFLINE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.small}>
                    {h.address || h.location || "City Centre"} · {h.distance || "Near you"}
                  </Text>
                </View>
                <Text style={s.arrow}>›</Text>
              </Card>
            </Pressable>
          );
        })
=======
      <Chips values={["All", "Nearby", "Recent"]} />
      {filteredHospitals.length === 0 ? (
        <Card>
          <Text style={s.rowTitle}>No hospitals found</Text>
          <Text style={s.small}>Please make sure your backend is active.</Text>
        </Card>
      ) : (
        filteredHospitals.map((h: Hospital) => (
          <Pressable
            key={h.id}
            onPress={() => {
              setHospital(h);
              router.push("/download");
            }}
          >
            <Card style={s.hospital}>
              <View style={s.building}>
                <AppIcon name="hospital" size={22} />
              </View>
              <View style={s.flex}>
                <Text style={s.rowTitle}>{h.name}</Text>
                <Text style={s.small}>
                  {h.address || "Healthcare Complex"} · {h.distance || "0.8 km"}
                </Text>
              </View>
              <Text style={s.arrow}>›</Text>
            </Card>
          </Pressable>
        ))
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
      )}
    </View>
  );
}
