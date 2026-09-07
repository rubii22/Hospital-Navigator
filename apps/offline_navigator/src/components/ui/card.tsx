import { BlurView } from "expo-blur";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";

export const Card = ({
  children,
  style,
  blur = 50,
}: {
  children: React.ReactNode;
  style?: object;
  blur?: number;
}) => {
  const theme = useTheme();
  const s = createStyles(theme);
  return (
    <BlurView intensity={blur} tint={theme.glassTint} style={[s.card, style]}>
      {children}
    </BlurView>
  );
};
