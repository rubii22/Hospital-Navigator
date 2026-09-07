import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Pressable,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface KeyboardAvoidingContainerProps {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
}

export function KeyboardAvoidingContainer({
  children,
  contentContainerStyle,
}: KeyboardAvoidingContainerProps) {
  const theme = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.avoidingView, { backgroundColor: theme.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <ScrollView
          style={{ backgroundColor: theme.background }}
          contentContainerStyle={[
            styles.scrollContainer,
            { backgroundColor: theme.background },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
