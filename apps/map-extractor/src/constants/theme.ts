export const ExtractorDarkTheme = {
  background: "#0a0f1d",
  surface: "rgba(22, 33, 58, 0.7)",
  surfaceRaised: "rgba(30, 45, 78, 0.85)",
  surfaceMuted: "rgba(15, 23, 42, 0.6)",
  border: "rgba(255, 255, 255, 0.1)",
  borderHighlight: "rgba(99, 102, 241, 0.35)",
  text: "#ffffff",
  textMuted: "#94a3b8",
  primary: "#6366f1",
  primarySoft: "rgba(99, 102, 241, 0.18)",
  secondary: "#4f46e5",
  accent: "#38bdf8",
  accentSoft: "rgba(56, 189, 248, 0.15)",
  success: "#10b981",
  successSoft: "rgba(16, 185, 129, 0.15)",
  warning: "#f59e0b",
  warningSoft: "rgba(245, 158, 11, 0.15)",
  danger: "#ef4444",
  dangerSoft: "rgba(239, 68, 68, 0.15)",
  glassTint: "dark" as const,
};

export const ExtractorLightTheme = {
  background: "#0f172a",
  surface: "rgba(30, 41, 59, 0.7)",
  surfaceRaised: "rgba(51, 65, 85, 0.85)",
  surfaceMuted: "rgba(15, 23, 42, 0.6)",
  border: "rgba(255, 255, 255, 0.12)",
  borderHighlight: "rgba(99, 102, 241, 0.4)",
  text: "#ffffff",
  textMuted: "#94a3b8",
  primary: "#6366f1",
  primarySoft: "rgba(99, 102, 241, 0.2)",
  secondary: "#4f46e5",
  accent: "#38bdf8",
  accentSoft: "rgba(56, 189, 248, 0.2)",
  success: "#10b981",
  successSoft: "rgba(16, 185, 129, 0.2)",
  warning: "#f59e0b",
  warningSoft: "rgba(245, 158, 11, 0.2)",
  danger: "#ef4444",
  dangerSoft: "rgba(239, 68, 68, 0.2)",
  glassTint: "dark" as const,
};

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const Space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export type ExtractorTheme = typeof ExtractorDarkTheme;
