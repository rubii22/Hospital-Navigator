import React, { useState } from "react";
import { View, TextInput, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";
import { AppButton } from "@/components/ui/app-button";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { AppIcon } from "@/components/ui/app-icon";

export default function Feedback() {
  const router = useRouter();
  const theme = useTheme();
  const s = createStyles(theme);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <View>
      <Heading title="Rate Your Navigation Experience" body="Your feedback helps improve indoor spatial accuracy and accessibility routes." />

      {submitted ? (
        <Card style={{ alignItems: "center", paddingVertical: 24, gap: 8 }}>
          <AppIcon name="check" size={42} color={theme.success} />
          <Text style={s.rowTitle}>Thank you for your feedback!</Text>
          <Text style={s.small}>Your rating ({rating} / 5 stars) has been recorded.</Text>
        </Card>
      ) : (
        <>
          <Card style={{ alignItems: "center", paddingVertical: 16 }}>
            <Text style={[s.rowTitle, { marginBottom: 10 }]}>Select Star Rating</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setRating(star)}>
                  <Text style={{ fontSize: 36, color: star <= rating ? theme.warning : theme.surfaceMuted }}>
                    ★
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[s.small, { marginTop: 6 }]}>{rating} of 5 Stars</Text>
          </Card>

          <TextInput
            multiline
            value={comment}
            onChangeText={setComment}
            placeholder="Share comments on corridor clarity, elevator prompts, or map accuracy (optional)..."
            placeholderTextColor={theme.textMuted}
            style={[s.input, s.comment, { marginTop: 12 }]}
          />

          <AppButton label="Submit Feedback" onPress={handleSubmit} />
        </>
      )}
    </View>
  );
}
