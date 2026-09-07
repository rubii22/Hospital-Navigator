import { StyleSheet } from 'react-native';
import { Theme, Radius, Space } from '@/constants/theme';

export const createStyles = (theme: Theme) => StyleSheet.create({
  label: { color: theme.textMuted, fontSize: 12, marginBottom: Space.xs },
  control: { borderColor: theme.borderHighlight, borderWidth: 1, backgroundColor: theme.surface, minHeight: 48, borderRadius: Radius.md, paddingHorizontal: Space.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' },
  value: { color: theme.text, fontSize: 14, fontWeight: '600' },
  chevron: { color: theme.primary, fontSize: 20 }
});
