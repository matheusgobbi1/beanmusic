import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";

type ButtonVariant = "primary" | "secondary" | "outlined" | "ghost";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  iconPosition?: "left" | "right";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  hapticFeedback?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  hapticFeedback = true,
}: ButtonProps) {
  const triggerHaptic = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      triggerHaptic();
      onPress();
    }
  };

  const buttonStyles = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const iconSize = size === "small" ? 16 : size === "medium" ? 18 : 24;
  const iconColor =
    variant === "primary"
      ? colors.primary.contrast
      : variant === "secondary"
      ? colors.secondary.contrast
      : colors.primary.main;

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "secondary"
              ? colors.neutral.white
              : colors.primary.main
          }
          size="small"
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={disabled ? colors.text.disabled : iconColor}
              style={styles.leftIcon}
            />
          )}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={disabled ? colors.text.disabled : iconColor}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 9999,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
  },
  secondaryButton: {
    backgroundColor: colors.secondary.main,
  },
  outlinedButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  mediumButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  largeButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 9999,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  disabledButton: {
    backgroundColor: colors.background.disabled,
    borderColor: colors.border.light,
    opacity: 0.7,
  },
  fullWidth: {
    width: "100%",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  primaryText: {
    color: colors.neutral.white,
  },
  secondaryText: {
    color: colors.neutral.white,
  },
  outlinedText: {
    color: colors.primary.main,
  },
  ghostText: {
    color: colors.primary.main,
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  disabledText: {
    color: colors.text.disabled,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
