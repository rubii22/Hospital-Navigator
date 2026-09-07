import React from "react";
import { View, ScrollView } from "react-native";
import { Slot } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { ExtractorProvider } from "@/context/ExtractorContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthScreen } from "@/components/AuthScreen";
import { Loader } from "@/components/ui/plus-loader";
import { AppHeader } from "@/components/ui/app-header";
import { AppBottomTabs } from "@/components/ui/app-bottom-tabs";
import { useTheme } from "@/hooks/useTheme";
import { styles } from "@/styles/layout.styles";

function LayoutContent() {
  const theme = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <Loader size={64} label="Initializing mapping dashboard..." />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <AppHeader />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Slot />
        </ScrollView>
        <AppBottomTabs />
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ExtractorProvider>
          <ToastProvider>
            <LayoutContent />
          </ToastProvider>
        </ExtractorProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
