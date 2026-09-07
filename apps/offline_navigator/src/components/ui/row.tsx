import { Pressable, View, Text } from "react-native";
import { BlurView } from "expo-blur";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import type { Destination } from "@/api/navigator-api";

export const getDestinationIcon = (item: Destination): AppIconName => {
  if (item.icon && ["department", "radiology", "pharmacy", "emergency", "room", "services"].includes(item.icon)) {
    return item.icon as AppIconName;
  }
  const nameLower = (item.name || "").toLowerCase();
  if (nameLower.includes("cardio")) return "department";
  if (nameLower.includes("radio") || nameLower.includes("x-ray")) return "radiology";
  if (nameLower.includes("pharm")) return "pharmacy";
  if (nameLower.includes("emerg") || nameLower.includes("trauma") || nameLower.includes("icu")) return "emergency";
  if (nameLower.includes("room") || nameLower.includes("opd") || nameLower.includes("mri")) return "room";
  if (item.category === "Department") return "department";
  if (item.category === "Service") return "services";
  return "room";
};

export const Row = ({
  item,
  onPress,
}: {
  item: Destination;
  onPress?: () => void;
}) => {
  const theme = useTheme();
  const s = createStyles(theme);
  const iconName = getDestinationIcon(item);

  return (
    <Pressable onPress={onPress}>
      <BlurView intensity={40} tint={theme.glassTint} style={s.row}>
        <View style={s.itemIcon}>
          <AppIcon name={iconName} size={18} />
        </View>
        <View style={s.flex}>
          <Text style={s.rowTitle}>{item.name}</Text>
          <Text style={s.small}>{item.detail}</Text>
        </View>
        <Text style={s.arrow}>›</Text>
      </BlurView>
    </Pressable>
  );
};
