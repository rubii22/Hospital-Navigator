import { StyleSheet } from 'react-native';
import { Theme, Radius } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 42, height: 42, backgroundColor: theme.primarySoft, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.primary },
  name: { color: theme.text, fontSize: 16, fontWeight: '800' },
  subName: { color: theme.primary, fontSize: 13, fontWeight: '700' }
});
