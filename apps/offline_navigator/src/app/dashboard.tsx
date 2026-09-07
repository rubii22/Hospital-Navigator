import React from "react";
<<<<<<< HEAD
import { View, Pressable, Text } from "react-native";
=======
import { View, Pressable, Text, StyleSheet } from "react-native";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { Card } from "@/components/ui/card";
import { Row } from "@/components/ui/row";

export default function Dashboard() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
<<<<<<< HEAD
  const { hospital, destinations, recentSearches, setQuery, selectDestination } = useAppContext();

  const tiles: [AppIconName, string, string][] = [
    ["department", "Departments", "/search"],
    ["room", "Find Room", "/search"],
    ["services", "Services", "/results"],
    ["hospital", "Floors", "/floors"],
    ["accessibility", "Preferences", "/preferences"],
    ["emergency", "Emergency", "/emergency"],
  ];

  const handleRecentClick = (term: string) => {
    const matched = destinations.find((d) => d.name.toLowerCase() === term.toLowerCase());
    if (matched) {
      selectDestination(matched);
      router.push("/detail");
    } else {
      setQuery(term);
      router.push("/results");
    }
  };

  return (
    <View>
      <Heading
        tag={hospital?.name ? hospital.name.toUpperCase() : "HOSPITAL NAVIGATOR"}
        title="Where would you like to go?"
        body="Search departments, scan a QR code, or choose a destination below."
      />

      <Pressable onPress={() => router.push("/search")}>
        <BlurView intensity={40} tint={theme.glassTint} style={s.search}>
          <View style={s.searchContent}>
            <AppIcon name="search" size={18} />
=======
  const {
    hospital,
    destinations,
    destination,
    recentSearches,
    setDestination,
    setQuery,
    offlinePackage,
    isOfflineMode,
  } = useAppContext();

  const hospitalName = hospital ? hospital.name : "Hospital Navigation";
  const hospitalAddress = hospital?.address || "Main Medical Campus";

  // Count real departments and rooms from bootstrap
  const deptCount = destinations.filter(
    (d) => d.category === "Department",
  ).length;
  const roomCount = destinations.filter(
    (d) => d.category === "Room" || d.category === "Service",
  ).length;
  const floorsCount = hospital?.floors_count || hospital?.floors?.length || 1;

  const actionCards: {
    id: string;
    title: string;
    subtitle: string;
    icon: AppIconName;
    route: string;
    badge?: string;
    color: string;
  }[] = [
    {
      id: "dept",
      title: "Departments",
      subtitle:
        deptCount > 0 ? `${deptCount} Clinical Units` : "Find Specialties",
      icon: "department",
      route: "/search",
      badge: `${deptCount}`,
      color: theme.primary,
    },
    {
      id: "rooms",
      title: "Rooms & Wards",
      subtitle: roomCount > 0 ? `${roomCount} Mapped Rooms` : "Patient Rooms",
      icon: "room",
      route: "/search",
      badge: `${roomCount}`,
      color: "#38bdf8",
    },
    {
      id: "floors",
      title: "Floor Plans",
      subtitle: `${floorsCount} Levels Available`,
      icon: "floors",
      route: "/floors",
      badge: `${floorsCount}F`,
      color: "#a78bfa",
    },
    {
      id: "emergency",
      title: "Emergency",
      subtitle: "Urgent Hotlines & Triage",
      icon: "emergency",
      route: "/emergency",
      badge: "24/7",
      color: theme.danger,
    },
  ];

  return (
    <View style={localStyles.container}>
      {/* Top Hospital Status Bar */}
      <View style={localStyles.topBar}>
        <View style={localStyles.hospitalInfo}>
          <Text style={[localStyles.hospitalName, { color: theme.text }]}>
            {hospitalName}
          </Text>
          <Text
            style={[localStyles.hospitalAddress, { color: theme.textMuted }]}
          >
            {hospitalAddress}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/hospital")}
          style={[
            localStyles.changeHospitalBtn,
            { borderColor: theme.border, backgroundColor: theme.surface },
          ]}
        >
          <Text
            style={[localStyles.changeHospitalText, { color: theme.primary }]}
          >
            Change
          </Text>
        </Pressable>
      </View>

      {/* Offline Status Badge */}
      <View style={localStyles.badgeRow}>
        <View
          style={[
            localStyles.statusPill,
            {
              backgroundColor:
                offlinePackage || isOfflineMode
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(56, 189, 248, 0.15)",
              borderColor:
                offlinePackage || isOfflineMode
                  ? "rgba(16, 185, 129, 0.4)"
                  : "rgba(56, 189, 248, 0.4)",
            },
          ]}
        >
          <View
            style={[
              localStyles.statusDot,
              {
                backgroundColor:
                  offlinePackage || isOfflineMode ? theme.success : "#38bdf8",
              },
            ]}
          />
          <Text
            style={[
              localStyles.statusText,
              {
                color:
                  offlinePackage || isOfflineMode ? theme.success : "#38bdf8",
              },
            ]}
          >
            {offlinePackage ? "Offline Map Package Active" : "Online Live Sync"}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <Pressable onPress={() => router.push("/search")}>
        <BlurView intensity={40} tint={theme.glassTint} style={s.search}>
          <View style={s.searchContent}>
            <AppIcon name="search" size={18} color={theme.textMuted} />
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
            <Text style={s.small}>Search departments, rooms, doctors…</Text>
          </View>
        </BlurView>
      </Pressable>

<<<<<<< HEAD
      <View style={s.grid}>
        {tiles.map(([icon, label, route]) => (
          <Pressable
            key={label}
            onPress={() => router.push(route as any)}
            style={{ width: "31%" }}
          >
            <BlurView intensity={30} tint={theme.glassTint} style={s.tile}>
              <AppIcon name={icon} size={25} color={icon === "emergency" ? theme.danger : theme.primary} />
              <Text style={s.tileText}>{label}</Text>
=======
      {/* 2x2 Clean Action Hub Cards */}
      <View style={localStyles.actionGrid}>
        {actionCards.map((card) => (
          <Pressable
            key={card.id}
            onPress={() => router.push(card.route as any)}
            style={localStyles.actionCardWrapper}
          >
            <BlurView
              intensity={35}
              tint={theme.glassTint}
              style={[
                localStyles.actionCard,
                { borderColor: theme.borderHighlight },
              ]}
            >
              <View style={localStyles.actionCardHeader}>
                <View
                  style={[
                    localStyles.actionIconWrap,
                    { backgroundColor: `${card.color}20` },
                  ]}
                >
                  <AppIcon name={card.icon} size={22} color={card.color} />
                </View>
                {card.badge && (
                  <View
                    style={[
                      localStyles.actionBadge,
                      {
                        backgroundColor: `${card.color}15`,
                        borderColor: `${card.color}35`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        localStyles.actionBadgeText,
                        { color: card.color },
                      ]}
                    >
                      {card.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[localStyles.actionTitle, { color: theme.text }]}>
                {card.title}
              </Text>
              <Text
                style={[localStyles.actionSubtitle, { color: theme.textMuted }]}
              >
                {card.subtitle}
              </Text>
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
            </BlurView>
          </Pressable>
        ))}
      </View>

<<<<<<< HEAD
      <Text style={s.section}>RECENT & POPULAR DESTINATIONS</Text>
      {recentSearches.length > 0 ? (
        recentSearches.slice(0, 4).map((name: string) => {
          const item = destinations.find((d) => d.name.toLowerCase() === name.toLowerCase());
          return (
            <Pressable key={name} onPress={() => handleRecentClick(name)}>
              <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View>
                    <Text style={s.rowTitle}>{name}</Text>
                    <Text style={s.small}>{item?.detail || "Ground Floor · Main Wing"}</Text>
                  </View>
=======
      {/* Quick Navigation Resume Card if Destination is set */}
      {destination && (
        <View style={localStyles.activeRouteSection}>
          <Text style={s.section}>ACTIVE DESTINATION</Text>
          <Pressable onPress={() => router.push("/route")}>
            <BlurView
              intensity={45}
              tint={theme.glassTint}
              style={[localStyles.routeCard, { borderColor: theme.primary }]}
            >
              <View style={localStyles.routeHeader}>
                <View
                  style={[
                    localStyles.routeIcon,
                    { backgroundColor: theme.primarySoft },
                  ]}
                >
                  <AppIcon name="navigation" size={20} color={theme.primary} />
                </View>
                <View style={s.flex}>
                  <Text style={s.rowTitle}>{destination.name}</Text>
                  <Text style={s.small}>{destination.detail}</Text>
                </View>
                <View
                  style={[
                    localStyles.goBtn,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={localStyles.goBtnText}>Go ›</Text>
                </View>
              </View>
            </BlurView>
          </Pressable>
        </View>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <>
          <Text style={s.section}>RECENT SEARCHES</Text>
          {recentSearches.slice(0, 3).map((term) => (
            <Pressable
              key={term}
              onPress={() => {
                setQuery(term);
                router.push("/search");
              }}
            >
              <Card>
                <View style={localStyles.recentRow}>
                  <AppIcon name="search" size={16} color={theme.textMuted} />
                  <Text style={[s.rowTitle, s.flex]}>{term}</Text>
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
                  <Text style={s.arrow}>›</Text>
                </View>
              </Card>
            </Pressable>
<<<<<<< HEAD
          );
        })
      ) : (
        <Card>
          <Text style={s.rowTitle}>No recent searches</Text>
          <Text style={s.small}>Destinations you search will appear here.</Text>
        </Card>
=======
          ))}
        </>
      )}

      {/* Popular Hospital Destinations */}
      {destinations.length > 0 && (
        <>
          <Text style={s.section}>HOSPITAL DESTINATIONS</Text>
          {destinations.slice(0, 5).map((d) => (
            <Row
              key={d.id}
              item={d}
              onPress={() => {
                setDestination(d);
                router.push("/detail");
              }}
            />
          ))}
        </>
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    gap: 4,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  hospitalInfo: {
    flex: 1,
    marginRight: 10,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  hospitalAddress: {
    fontSize: 12,
    marginTop: 2,
  },
  changeHospitalBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  changeHospitalText: {
    fontSize: 12,
    fontWeight: "700",
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  actionCardWrapper: {
    width: "48%",
  },
  actionCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 112,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  actionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11,
    fontWeight: "500",
  },
  activeRouteSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  routeCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  routeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  goBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  goBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
