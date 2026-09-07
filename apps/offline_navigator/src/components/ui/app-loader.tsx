import { ActivityIndicator, Text, View } from 'react-native'; 
import { useTheme } from '@/hooks/useTheme';
import { createStyles } from "@/styles/app-loader.styles";
import { AppLogo } from './app-logo';

export function AppLoader({ label = 'Preparing your navigator…' }: { label?: string }) { 
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <AppLogo compact />
      <ActivityIndicator color={theme.primary} size="large" />
      <Text style={styles.text}>{label}</Text>
    </View>
  ); 
}
