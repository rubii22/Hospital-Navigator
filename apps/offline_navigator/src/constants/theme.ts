export const LightTheme = {
  background: "#f0f5fa",
  surface: "rgba(255, 255, 255, 0.7)",
  surfaceRaised: "rgba(255, 255, 255, 0.9)",
  surfaceMuted: "rgba(220, 230, 240, 0.5)",
  border: "rgba(0, 50, 100, 0.1)",
  borderHighlight: "rgba(255, 255, 255, 0.8)",
  text: "#112233",
  textMuted: "#667788",
  primary: "#007aff",
  primarySoft: "rgba(0, 122, 255, 0.1)",
  accent: "#5856d6",
  success: "#34c759",
  warning: "#ff9500",
  danger: "#ff3b30",
  glassTint: "light" as const,
};

export const DarkTheme = {
  background: "#040b16",
  surface: "rgba(15, 30, 50, 0.65)",
  surfaceRaised: "rgba(25, 45, 70, 0.8)",
  surfaceMuted: "rgba(10, 20, 35, 0.5)",
  border: "rgba(255, 255, 255, 0.1)",
  borderHighlight: "rgba(255, 255, 255, 0.2)",
  text: "#f7fbff",
  textMuted: "#9ab",
  primary: "#0a84ff",
  primarySoft: "rgba(10, 132, 255, 0.15)",
  accent: "#5e5ce6",
  success: "#32d74b",
  warning: "#ff9f0a",
  danger: "#ff453a",
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
export type Theme = typeof LightTheme | typeof DarkTheme;
