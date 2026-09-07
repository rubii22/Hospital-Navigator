import React from "react";
import { View, Pressable, Text } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
<<<<<<< HEAD
import { AppIcon } from "@/components/ui/app-icon";
import type { Floor } from "@/types/navigator.types";
=======
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688

export default function Floors() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
<<<<<<< HEAD
  const { hospital, floors, selectedFloor, selectFloor } = useAppContext();

  const floorList = floors.length > 0
    ? floors
    : [
        { id: 1, building_id: 1, name: "Floor 3", floor_number: 3, status: "active" },
        { id: 2, building_id: 1, name: "Floor 2", floor_number: 2, status: "active" },
        { id: 3, building_id: 1, name: "Floor 1", floor_number: 1, status: "active" },
        { id: 4, building_id: 1, name: "Ground Floor", floor_number: 0, status: "active" },
        { id: 5, building_id: 1, name: "Basement 1", floor_number: -1, status: "active" },
      ];

  const handleSelectFloor = (floor: Floor) => {
    selectFloor(floor);
    router.push("/dashboard");
  };
=======
  const { bootstrapData, currentFloorId, setCurrentFloorId, hospital } = useAppContext();

  const allFloors: { id: number; name: string; display_name: string; floor_number: number; building_name: string; rooms_count: number }[] = [];

  if (bootstrapData?.buildings) {
    for (const b of bootstrapData.buildings) {
      for (const f of b.floors) {
        allFloors.push({
          id: f.id,
          name: f.name,
          display_name: f.display_name,
          floor_number: f.floor_number,
          building_name: b.name,
          rooms_count: f.rooms_count,
        });
      }
    }
  }

  const currentFloorObj = allFloors.find((f) => f.id === currentFloorId);
  const currentTag = currentFloorObj
    ? `CURRENT: ${currentFloorObj.display_name.toUpperCase()}`
    : "FLOOR SELECTION";
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688

  return (
    <View>
      <Heading
<<<<<<< HEAD
        tag={hospital?.name ? hospital.name.toUpperCase() : "FLOOR SELECTION"}
        title="Select Hospital Floor"
        body="Browse rooms and departments by floor level."
      />

      {floorList.map((f: Floor) => {
        const isSelected = selectedFloor?.id === f.id || (selectedFloor === null && f.floor_number === 0);
        return (
          <Pressable key={f.id} onPress={() => handleSelectFloor(f)}>
            <BlurView
              intensity={30}
              tint={theme.glassTint}
              style={[s.floor, isSelected && s.floorActive]}
            >
              <Text style={s.floorNum}>
                {f.floor_number === 0 ? "G" : f.floor_number < 0 ? `B${Math.abs(f.floor_number)}` : String(f.floor_number)}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>{f.name || `Floor ${f.floor_number}`}</Text>
                <Text style={s.small}>{isSelected ? "Currently Active Floor" : "Tap to switch floor"}</Text>
              </View>
              {isSelected && <AppIcon name="check" size={20} color={theme.text} />}
            </BlurView>
          </Pressable>
        );
      })}
=======
        tag={hospital ? hospital.name.toUpperCase() : currentTag}
        title="Select floor"
      />
      {allFloors.length === 0 ? (
        <Card>
          <Text style={s.rowTitle}>No floors registered</Text>
          <Text style={s.small}>Check building setup or scan status.</Text>
        </Card>
      ) : (
        allFloors.map((floor) => {
          const isActive = floor.id === currentFloorId;
          const floorLabel = floor.floor_number === 0 ? "G" : `${floor.floor_number}`;
          return (
            <Pressable
              key={floor.id}
              onPress={() => {
                setCurrentFloorId(floor.id);
                router.push("/dashboard");
              }}
            >
              <BlurView
                intensity={30}
                tint={theme.glassTint}
                style={[s.floor, isActive && s.floorActive]}
              >
                <Text style={s.floorNum}>{floorLabel}</Text>
                <View style={s.flex}>
                  <Text style={s.rowTitle}>{floor.display_name || floor.name}</Text>
                  <Text style={s.small}>
                    {floor.building_name} · {floor.rooms_count} rooms
                  </Text>
                </View>
                {isActive && <Text style={s.ok}>✓</Text>}
              </BlurView>
            </Pressable>
          );
        })
      )}
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
    </View>
  );
}
