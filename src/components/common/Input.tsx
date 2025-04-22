import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ComponentProps<typeof Ionicons>["name"];
  rightIcon?: React.ComponentProps<typeof Ionicons>["name"];
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  keyboardType?:
    | "default"
    | "number-pad"
    | "decimal-pad"
    | "numeric"
    | "email-address"
    | "phone-pad"
    | "url";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?:
    | "off"
    | "username"
    | "password"
    | "email"
    | "name"
    | "tel"
    | "street-address"
    | "postal-code"
    | "cc-number";
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  required?: boolean;
  maxLength?: number;
}

export default function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoComplete = "off",
  style,
  inputStyle,
  labelStyle,
  required = false,
  maxLength,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Determine the container border color based on state
  const getBorderColor = () => {
    if (error) return colors.status.error.main;
    if (isFocused) return colors.primary.main;
    return colors.neutral.darker;
  };

  // Get icon color
  const getIconColor = (isError: boolean) => {
    if (isError) return colors.status.error.main;
    if (isFocused) return colors.primary.main;
    return colors.neutral.light;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.requiredStar}> *</Text>}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: colors.neutral.darkest,
          },
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          multiline && styles.multilineContainer,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons name={leftIcon} size={20} color={getIconColor(!!error)} />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral.dark}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={!disabled}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={maxLength}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color={colors.neutral.light}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={getIconColor(!!error)}
            />
          </TouchableOpacity>
        )}
      </View>

      {(error || helper) && (
        <Text
          style={[
            styles.helperText,
            error ? styles.errorText : styles.helperTextStyle,
          ]}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  labelContainer: {
    marginBottom: 6,
    flexDirection: "row",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.neutral.white,
  },
  requiredStar: {
    color: colors.status.error.main,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputContainerFocused: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.status.error.main,
  },
  multilineContainer: {
    minHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: "flex-start",
  },
  input: {
    flex: 1,
    color: colors.neutral.white,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    textAlignVertical: "center",
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  multilineInput: {
    height: "100%",
    textAlignVertical: "top",
  },
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helperTextStyle: {
    color: colors.neutral.light,
  },
  errorText: {
    color: colors.status.error.light,
  },
});
