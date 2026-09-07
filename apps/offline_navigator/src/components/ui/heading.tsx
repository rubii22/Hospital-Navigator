import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/shared.styles";

export const Heading = ({
  tag,
  title,
  body,
}: {
  tag?: string;
  title: string;
  body?: string;
}) => {
  const theme = useTheme();
  const s = createStyles(theme);
  return (
    <View style={s.heading}>
      {tag && <Text style={s.tag}>{tag}</Text>}
      <Text style={s.title}>{title}</Text>
      {body && <Text style={s.body}>{body}</Text>}
    </View>
  );
};
