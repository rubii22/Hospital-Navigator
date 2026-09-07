import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { createStyles } from "@/styles/app-logo.styles";
import { AppIcon } from './app-icon';

export function AppLogo({ compact = false }: { compact?: boolean }) { 
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <AppIcon name="medical" size={25} color={theme.primary} />
      </View>
      {!compact && (
        <View>
          <Text style={styles.name}>Hospital</Text>
          <Text style={styles.subName}>Navigator</Text>
        </View>
      )}
    </View>
  ); 
}
