import { Pressable, Text, View } from 'react-native'; 
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import { createStyles } from "@/styles/app-dropdown.styles";

export function AppDropdown({ label, value, onPress }: { label?: string; value: string; onPress?: () => void }) { 
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable onPress={onPress}>
        <BlurView intensity={30} tint={theme.glassTint} style={styles.control}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.chevron}>⌄</Text>
        </BlurView>
      </Pressable>
    </View>
  ); 
}
