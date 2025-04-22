import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../../constants/colors";
import OptionCard, { OptionCardProps } from "./OptionCard";

interface OptionsSectionProps {
  title: string;
  options: Omit<OptionCardProps, "rightIcon">[];
}

const OptionsSection = ({ title, options }: OptionsSectionProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <OptionCard key={index} {...option} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 12,
    paddingLeft: 4,
  },
  optionsContainer: {
    gap: 8,
  },
});

export default OptionsSection;
