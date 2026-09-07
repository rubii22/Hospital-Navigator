import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { Heading } from "@/components/ui/heading";
import { Row } from "@/components/ui/row";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";
import { AppButton } from "@/components/ui/app-button";
import type { DestinationItem } from "@/types/navigator.types";

export default function Results() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
  const { destinations, query, setQuery, selectDestination } = useAppContext();

  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Department", "Room", "Service"];

  const results = destinations.filter((item: DestinationItem) => {
    const matchesQuery =
      query.trim() === "" ||
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.detail.toLowerCase().includes(query.toLowerCase());

    if (!matchesQuery) return false;

    if (activeCategory !== "All") {
      return item.category === activeCategory;
    }
    return true;
  });

  const handleSelectItem = (item: DestinationItem) => {
    selectDestination(item);
    router.push("/detail");
  };

  return (
    <View>
      <Heading
        tag={query.trim() ? `SEARCH: “${query.toUpperCase()}”` : "ALL DESTINATIONS"}
        title="Search results"
        body={`${results.length} destination${results.length === 1 ? "" : "s"} found`}
      />

      <View style={s.chips}>
        {categories.map((cat) => (
          <Pressable key={cat} onPress={() => setActiveCategory(cat)}>
            <Text style={activeCategory === cat ? s.chipOn : s.chip}>{cat}</Text>
          </Pressable>
        ))}
      </View>

      {results.length === 0 ? (
        <Card style={{ alignItems: "center", paddingVertical: 24, gap: 8 }}>
          <AppIcon name="search" size={32} color={theme.textMuted} />
          <Text style={s.rowTitle}>No results found</Text>
          <Text style={[s.small, { textAlign: "center" }]}>
            We couldn't find any destination matching "{query}".
          </Text>
          <AppButton
            label="Clear Search"
            variant="secondary"
            onPress={() => setQuery("")}
            style={{ marginTop: 8 }}
          />
        </Card>
      ) : (
        results.map((x: DestinationItem) => (
          <Row key={x.id} item={x} onPress={() => handleSelectItem(x)} />
        ))
      )}
    </View>
  );
}
