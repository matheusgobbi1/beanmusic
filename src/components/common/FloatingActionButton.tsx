import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useRouter, usePathname } from "expo-router";
import * as Haptics from "expo-haptics";
import colors from "../../constants/colors";

const { width } = Dimensions.get("window");
const BUTTON_SIZE = 65;
const ACTION_BUTTON_SIZE = 55;
const TABBAR_WIDTH = width * 0.85;
const TABBAR_HEIGHT = 20;
const TABBAR_BORDER_RADIUS = 40;
const BOTTOM_OFFSET = 10; // Offset para posicionamento

// Função segura para Haptics
const safeHaptics = {
  impactAsync: (style: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS === "ios") {
      // Reduzir frequência de haptics no iOS
      setTimeout(() => Haptics.impactAsync(style), 0);
    } else {
      Haptics.impactAsync(style);
    }
  },
  selectionAsync: () => {
    if (Platform.OS === "ios") {
      // Reduzir frequência de haptics no iOS
      setTimeout(() => Haptics.selectionAsync(), 0);
    } else {
      Haptics.selectionAsync();
    }
  },
  notificationAsync: (type: Haptics.NotificationFeedbackType) => {
    Haptics.notificationAsync(type);
  },
};

type FABAction = {
  icon: React.ComponentProps<typeof Ionicons>["name"] | string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
  label?: string;
  testID?: string;
  iconType?: "ionicons" | "fontawesome" | "fontawesome5";
  direction?: "left" | "right"; // Direção para animação
};

interface FloatingActionButtonProps {
  mainIcon?: React.ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
  testID?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  mainIcon = "add",
  onPress,
  testID = "fab-main",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Valores para animações
  const animation = useRef(new Animated.Value(0)).current;
  const backdropAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  // Define as ações baseadas no contexto da tela atual
  const getContextualActions = useCallback((): FABAction[] => {
    // Ações para a tela de campanhas
    if (pathname.includes("campanhas")) {
      return [
        {
          icon: "spotify",
          color: colors.neutral.white,
          backgroundColor: "#1DB954", // Cor do Spotify
          iconType: "fontawesome",
          direction: "left",
          onPress: () => {
            safeHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // Navegação para criação de campanha no Spotify
            router.push("/(campanhas)/spotify");
            toggleMenu();
          },
          testID: "fab-spotify",
        },
        {
          icon: "youtube-play",
          color: colors.neutral.white,
          backgroundColor: "#FF0000", // Cor do YouTube
          iconType: "fontawesome",
          direction: "left",
          onPress: () => {
            safeHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // Futura navegação para criação de campanha no YouTube
            console.log("Criar campanha YouTube");
            toggleMenu();
          },
          testID: "fab-youtube",
        },
        {
          icon: "instagram",
          color: colors.neutral.white,
          backgroundColor: "#C13584", // Cor do Instagram
          iconType: "fontawesome",
          direction: "right",
          onPress: () => {
            safeHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // Futura navegação para criação de campanha no Instagram
            console.log("Criar campanha Instagram");
            toggleMenu();
          },
          testID: "fab-instagram",
        },
        {
          icon: "tiktok",
          color: colors.neutral.white,
          backgroundColor: "#000000", // Cor do TikTok
          iconType: "fontawesome5",
          direction: "right",
          onPress: () => {
            safeHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // Futura navegação para criação de campanha no TikTok
            console.log("Criar campanha TikTok");
            toggleMenu();
          },
          testID: "fab-tiktok",
        },
      ];
    }

    // Padrão para outras telas (pode ser expandido no futuro)
    return [
      {
        icon: "add-circle",
        color: colors.neutral.white,
        backgroundColor: colors.secondary.main,
        direction: "left", // Direção padrão
        onPress: () => {
          safeHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          console.log("Adicionar novo item");
          toggleMenu();
        },
        testID: "fab-add",
      },
    ];
  }, [pathname, router]);

  const actions = getContextualActions();

  // Fecha o menu quando muda de tela
  useEffect(() => {
    if (isOpen) {
      toggleMenu();
    }
  }, [pathname]);

  const toggleMenu = () => {
    safeHaptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const toValue = isOpen ? 0 : 1;

    // Anima backdrop
    Animated.timing(backdropAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Anima botões
    Animated.spring(animation, {
      toValue,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // Anima rotação do ícone principal
    Animated.timing(rotateAnimation, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen);
  };

  // Rotação do ícone principal
  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  // Renderiza ações expansíveis
  const renderActions = () => {
    return actions.map((action, index) => {
      // Conta quantos botões em cada direção para calcular deslocamento
      const leftActions = actions.filter((a) => a.direction === "left");
      const rightActions = actions.filter((a) => a.direction === "right");

      // Calcula o deslocamento para cada botão baseado na sua direção
      const leftIndex =
        action.direction === "left" ? leftActions.indexOf(action) + 1 : 0;
      const rightIndex =
        action.direction === "right" ? rightActions.indexOf(action) + 1 : 0;

      const offset =
        (action.direction === "left" ? leftIndex : rightIndex) *
        (ACTION_BUTTON_SIZE + 12);

      // Anima cada botão de ação baseado na sua direção
      const translateX = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, action.direction === "left" ? -offset : offset],
      });

      const scale = animation.interpolate({
        inputRange: [0, 0.8, 1],
        outputRange: [0, 1.1, 1],
      });

      const opacity = animation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.8, 1],
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.actionButton,
            {
              opacity,
              transform: [{ translateX }, { scale }],
            },
          ]}
        >
          <Pressable
            style={[
              styles.actionButtonInner,
              { backgroundColor: action.backgroundColor },
            ]}
            onPress={action.onPress}
            testID={action.testID}
            android_ripple={{
              color: "rgba(255, 255, 255, 0.2)",
              borderless: true,
            }}
            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
          >
            {action.iconType === "fontawesome" ? (
              <FontAwesome name={action.icon} size={24} color={action.color} />
            ) : action.iconType === "fontawesome5" ? (
              <FontAwesome5 name={action.icon} size={24} color={action.color} />
            ) : (
              <Ionicons
                name={
                  action.icon as React.ComponentProps<typeof Ionicons>["name"]
                }
                size={24}
                color={action.color}
              />
            )}
          </Pressable>
        </Animated.View>
      );
    });
  };

  return (
    <>
      {/* Backdrop/Overlay quando o menu está aberto */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropAnimation }]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Pressable style={styles.backdropPressable} onPress={toggleMenu} />
      </Animated.View>

      {/* Container para o FAB e suas ações */}
      <View style={styles.container} pointerEvents="box-none">
        {/* Botões de ação contextual */}
        {renderActions()}

        {/* Botão principal do FAB */}
        <Pressable
          style={styles.fab}
          onPress={onPress || toggleMenu}
          testID={testID}
          android_ripple={{
            color: "rgba(255, 255, 255, 0.2)",
            borderless: true,
          }}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name={mainIcon} size={32} color={colors.neutral.white} />
          </Animated.View>
        </Pressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    bottom: TABBAR_HEIGHT + 25, // Aumentado para ficar mais abaixo
    left: width / 2 - BUTTON_SIZE / 2, // Centralizado no meio da tela
    zIndex: 999,
    flexDirection: "row",
  },
  fab: {
    backgroundColor: colors.primary.main,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    zIndex: 1,
  },
  actionButton: {
    position: "absolute",
    width: ACTION_BUTTON_SIZE,
    height: ACTION_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
  actionButtonInner: {
    width: ACTION_BUTTON_SIZE - 10,
    height: ACTION_BUTTON_SIZE - 10,
    borderRadius: (ACTION_BUTTON_SIZE - 10) / 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 998,
  },
  backdropPressable: {
    width: "100%",
    height: "100%",
  },
});

export default FloatingActionButton;
