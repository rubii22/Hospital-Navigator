import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, Animated, Easing } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface PlusLoaderProps {
  size?: number;
  label?: string;
  overlay?: boolean;
}

export function Loader({ size = 64, label, overlay = false }: PlusLoaderProps) {
  const theme = useTheme();
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fillAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fillAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // height animations can't use native driver
        }),
        Animated.timing(fillAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );

    fillAnimation.start();
    return () => fillAnimation.stop();
  }, [fillAnim]);

  const barThickness = size * 0.28;
  const horizontalBarWidth = size;
  const verticalBarHeight = size;

  const maskHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size],
  });

  const loaderContent = (
    <View style={styles.container}>
      <View style={[styles.plusFrame, { width: size, height: size }]}>
        <View style={[styles.plusOutline, { width: size, height: size }]}>
          <View
            style={[
              styles.bar,
              {
                width: horizontalBarWidth,
                height: barThickness,
                backgroundColor: theme.surfaceMuted,
                borderColor: theme.border,
                borderWidth: 2,
                borderRadius: 4,
                position: "absolute",
                top: (size - barThickness) / 2,
              },
            ]}
          />
          <View
            style={[
              styles.bar,
              {
                width: barThickness,
                height: verticalBarHeight,
                backgroundColor: theme.surfaceMuted,
                borderColor: theme.border,
                borderWidth: 2,
                borderRadius: 4,
                position: "absolute",
                left: (size - barThickness) / 2,
              },
            ]}
          />
        </View>

        <Animated.View
          style={[
            styles.plusMask,
            {
              width: size,
              height: maskHeight,
            },
          ]}
        >
          <View style={[styles.plusFilled, { width: size, height: size }]}>
            <View
              style={[
                styles.bar,
                {
                  width: horizontalBarWidth,
                  height: barThickness,
                  backgroundColor: theme.accent,
                  borderRadius: 4,
                  position: "absolute",
                  top: (size - barThickness) / 2,
                },
              ]}
            />
            {/* Vertical filled bar */}
            <View
              style={[
                styles.bar,
                {
                  width: barThickness,
                  height: verticalBarHeight,
                  backgroundColor: theme.accent,
                  borderRadius: 4,
                  position: "absolute",
                  left: (size - barThickness) / 2,
                },
              ]}
            />
          </View>
        </Animated.View>
      </View>

      {label && (
        <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View
        style={[
          styles.overlayContainer,
          { backgroundColor: "rgba(0, 0, 0, 0.75)" },
        ]}
      >
        <View
          style={[
            styles.overlayCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {loaderContent}
        </View>
      </View>
    );
  }

  return loaderContent;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  plusFrame: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  plusOutline: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  plusMask: {
    position: "absolute",
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },
  plusFilled: {
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  bar: {
    boxSizing: "border-box",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  overlayCard: {
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
  },
});
