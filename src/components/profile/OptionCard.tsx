import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";

export interface OptionCardProps {
  title: string;
  icon: string;
  onPress: () => void;
  description?: string;
  rightIcon?: string;
}

const OptionCard = ({
  title,
  icon,
  onPress,
  description,
  rightIcon = "chevron-forward",
}: OptionCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={22} color={colors.primary.main} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Ionicons
        name={rightIcon as any}
        size={18}
        color={colors.text.secondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary.main}20`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  description: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
});

export default OptionCard;
