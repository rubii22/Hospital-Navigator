<<<<<<< HEAD
import React from "react";
import { View, TextInput, Text } from "react-native";
=======
import React, { useState, useMemo } from "react";
import { View, TextInput, Text, Pressable, StyleSheet } from "react-native";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { Heading } from "@/components/ui/heading";
import { Row } from "@/components/ui/row";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
<<<<<<< HEAD
import type { DestinationItem } from "@/types/navigator.types";
=======
import type { Destination } from "@/api/navigator-api";

const categories = ["All", "Department", "Room", "Service"] as const;
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688

export default function Search() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
<<<<<<< HEAD
  const { destinations, query, setQuery, selectDestination } = useAppContext();

  const filtered = query.trim()
    ? destinations.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.detail.toLowerCase().includes(query.toLowerCase())
      )
    : destinations.slice(0, 6);

  const handleSelectItem = (item: DestinationItem) => {
    selectDestination(item);
=======
  const {
    destinations,
    query,
    setQuery,
    setDestination,
    addRecentSearch,
    hospital,
  } = useAppContext();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Instant real-time filter across all hospital destinations
  const filteredDestinations = useMemo(() => {
    let list = destinations || [];

    if (selectedCategory !== "All") {
      list = list.filter((d) => d.category === selectedCategory);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.detail && d.detail.toLowerCase().includes(q)) ||
          (d.room_number && d.room_number.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [destinations, query, selectedCategory]);

  const handleSelect = (item: Destination) => {
    setDestination(item);
    addRecentSearch(item.name);
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
    router.push("/detail");
  };

  return (
<<<<<<< HEAD
    <View>
      <Heading tag="INDOOR SEARCH" title="Find your destination" body="Search by department name, room number, or service." />
      
      <TextInput
        autoFocus
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => router.push("/results")}
        placeholder="Search departments, rooms, clinics…"
        placeholderTextColor={theme.textMuted}
        style={s.input}
        returnKeyType="search"
      />

      <Text style={s.section}>{query.trim() ? "MATCHING DESTINATIONS" : "POPULAR DESTINATIONS"}</Text>

      {filtered.length === 0 ? (
        <Card style={{ alignItems: "center", paddingVertical: 20 }}>
          <AppIcon name="search" size={28} color={theme.textMuted} />
          <Text style={[s.rowTitle, { marginTop: 8 }]}>No destinations found</Text>
          <Text style={s.small}>Try searching for Cardiology, Radiology, Pharmacy, or Room 101.</Text>
        </Card>
      ) : (
        filtered.map((item: DestinationItem) => (
          <Row key={item.id} item={item} onPress={() => handleSelectItem(item)} />
        ))
      )}
=======
    <View style={{ gap: 14 }}>
      <Heading
        tag={hospital ? hospital.name.toUpperCase() : "DIRECTORY"}
        title="Search Destinations"
        body="Find clinical units, doctor suites, and emergency rooms."
      />

      {/* Search Input Box */}
      <View style={localStyles.inputContainer}>
        <AppIcon name="search" size={18} color={theme.textMuted} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Search Cardiology, MRI, Room 101…"
          placeholderTextColor={theme.textMuted}
          style={[localStyles.input, { color: theme.text }]}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <Text
              style={{
                color: theme.textMuted,
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              ✕
            </Text>
          </Pressable>
        )}
      </View>

      {/* Filter Category Pills */}
      <View style={localStyles.pillRow}>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                localStyles.pill,
                isActive
                  ? {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    }
                  : {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
              ]}
            >
              <Text
                style={[
                  localStyles.pillText,
                  { color: isActive ? "#ffffff" : theme.textMuted },
                ]}
              >
                {cat === "All" ? "All Units" : `${cat}s`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Results Section */}
      <View style={{ gap: 8 }}>
        <View style={localStyles.sectionHeader}>
          <Text style={s.section}>
            {query.trim() ? "SEARCH RESULTS" : "ALL DESTINATIONS"}
          </Text>
          <Text style={localStyles.countBadge}>
            {filteredDestinations.length} found
          </Text>
        </View>

        {filteredDestinations.length === 0 ? (
          <Card>
            <Text style={s.rowTitle}>No matches found</Text>
            <Text style={s.small}>
              Try searching by room number (e.g. 201) or clinical department
              name.
            </Text>
          </Card>
        ) : (
          filteredDestinations.map((item: Destination) => (
            <Row key={item.id} item={item} onPress={() => handleSelect(item)} />
          ))
        )}
      </View>
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
    </View>
  );
}

const localStyles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  countBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
});
