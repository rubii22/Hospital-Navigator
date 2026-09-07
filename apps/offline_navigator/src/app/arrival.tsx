import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { AppButton } from "@/components/ui/app-button";
import { AppIcon } from "@/components/ui/app-icon";
import { Heading } from "@/components/ui/heading";

export default function Arrival() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);
  const { destination, hospital } = useAppContext();

  return (
    <View style={s.center}>
      <View style={s.check}>
        <AppIcon name="check" size={40} color={theme.success} />
      </View>
<<<<<<< HEAD
      <Heading tag="NAVIGATION COMPLETE" title="You Have Arrived!" />
      <Text style={s.metric}>{destination?.name || "Your Destination"}</Text>
      <Text style={s.body}>{destination?.detail || "Floor 2, Building A"} · {hospital?.name || "Hospital"}</Text>

      <View style={{ width: "100%", gap: 12, marginTop: 16 }}>
        <AppButton label="View Department Info" onPress={() => router.push("/detail")} />
        <AppButton label="Rate Navigation & Feedback" variant="secondary" onPress={() => router.push("/feedback")} />
        <AppButton label="Return to Dashboard" variant="secondary" onPress={() => router.push("/dashboard")} />
      </View>
=======
      <Heading tag="NAVIGATION COMPLETED" title="You have arrived" />
      <Text style={s.metric}>{destination?.name || "Destination Reached"}</Text>
      <Text style={s.body}>{destination?.detail || "Destination entrance"}</Text>
      <AppButton label="View details" onPress={() => router.push("/detail")} />
      <AppButton
        label="Back to dashboard"
        variant="secondary"
        style={s.top}
        onPress={() => router.push("/dashboard")}
      />
>>>>>>> 6ade8adba5b6b443f86e2b843418749a1d27b688
    </View>
  );
}
