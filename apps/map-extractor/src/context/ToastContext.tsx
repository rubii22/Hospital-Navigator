import React, { createContext, useContext, useState, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
} from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const { width } = Dimensions.get("window");

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef<any>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newToast = { id: String(Date.now()), message, type };
    setActiveToast(newToast);
    fadeAnim.setValue(0);
    slideAnim.setValue(-100);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 10,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
    timeoutRef.current = setTimeout(() => {
      dismissToast();
    }, 3500);
  };

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveToast(null);
    });
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <Feather name="check-circle" size={18} color="#10b981" />;
      case "error":
        return <Feather name="x-circle" size={18} color="#ef4444" />;
      case "warning":
        return <Feather name="alert-triangle" size={18} color="#f59e0b" />;
      case "info":
      default:
        return <Feather name="info" size={18} color="#38bdf8" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {activeToast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <BlurView intensity={85} tint="dark" style={styles.blurWrap}>
            <View style={styles.content}>
              <View style={styles.iconWrap}>{getIcon(activeToast.type)}</View>
              <Text style={styles.text}>{activeToast.message}</Text>
              <Pressable onPress={dismissToast} style={styles.closeBtn}>
                <Feather name="x" size={14} color="#94a3b8" />
              </Pressable>
            </View>
          </BlurView>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.35)",
  },
  blurWrap: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.22)",
    backgroundColor: "rgba(20, 25, 40, 0.96)",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  iconWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  closeBtn: {
    padding: 2,
  },
});
