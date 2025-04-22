import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../../constants/colors";

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ComponentProps<typeof Ionicons>["name"];
  rightIcon?: React.ComponentProps<typeof Ionicons>["name"];
  onLeftPress?: () => void;
  onRightPress?: () => void;
  transparent?: boolean;
  showBackButton?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  showLogo?: boolean;
}

export default function Header({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  transparent = false,
  showBackButton = false,
  style,
  titleStyle,
  subtitleStyle,
  showLogo = false,
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleLeftPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onLeftPress) {
      onLeftPress();
    }
  };

  const handleRightPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onRightPress) {
      onRightPress();
    }
  };

  // Usar left icon fornecido, ou back button se showBackButton for true
  const leftIconToUse = showBackButton ? "arrow-back" : leftIcon;
  const leftPressHandler = showBackButton ? handleBackPress : handleLeftPress;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: transparent
            ? "transparent"
            : colors.background.default,
        },
        style,
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.content}>
        <View style={styles.leadingContainer}>
          {showLogo ? (
            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : leftIconToUse ? (
            <Pressable
              style={styles.iconButton}
              onPress={leftPressHandler}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={leftIconToUse}
                size={24}
                color={colors.text.primary}
              />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, titleStyle]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, subtitleStyle]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.trailingContainer}>
          {rightIcon && (
            <Pressable
              style={styles.iconButton}
              onPress={handleRightPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={!onRightPress}
            >
              <Ionicons
                name={rightIcon}
                size={24}
                color={colors.primary.main}
              />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 16,
  },
  leadingContainer: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  trailingContainer: {
    width: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.primary.main,
    textAlign: "center",
    marginTop: 2,
  },
  iconButton: {
    padding: 6,
  },
  logo: {
    width: 30,
    height: 25,
  },
});
