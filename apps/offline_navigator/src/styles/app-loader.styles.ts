import { StyleSheet } from 'react-native';
import { Theme, Space } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', gap: Space.lg },
  text: { color: theme.textMuted, fontSize: 14 }
});
