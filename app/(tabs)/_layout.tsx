import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import colors from "../../src/constants/colors";
import { useReducer } from "react";
import { ProtectedRoute } from "../../src/components/ProtectedRoute";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FloatingActionButton } from "../../src/components/common";

const { width } = Dimensions.get("window");

// Constantes para a TabBar
const TABBAR_WIDTH = width * 0.85;
const TABBAR_HEIGHT = 65;
const TABBAR_MARGIN = (width - TABBAR_WIDTH) / 2;
const FAB_SIZE = 65; // Tamanho do FAB
const CENTER_GAP = 100; // Espaço no centro da TabBar

function TabBarIcon({
  name,
  color,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}) {
  return (
    <View style={styles.iconWrapper}>
      <Ionicons size={26} name={name} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // Ajustar posição da TabBar com base no safe area
  const dynamicBottom = insets.bottom > 0 ? insets.bottom + 10 : 30;

  // Controle para renderização da TabBar
  const [tabBarReady, forceTabBarReady] = useReducer(() => true, false);

  // Forçar atualização da TabBar após o primeiro render
  if (!tabBarReady) {
    setTimeout(() => forceTabBarReady(), 10);
  }

  // Função para acionar o feedback tátil
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary.main,
          tabBarInactiveTintColor: colors.text.secondary,
          tabBarShowLabel: false,
          tabBarStyle: [
            styles.tabBar,
            {
              bottom: dynamicBottom,
              width: TABBAR_WIDTH,
              marginHorizontal: TABBAR_MARGIN,
            },
            !tabBarReady && { opacity: 0 }, // Esconde a TabBar até estar pronta
          ],
          tabBarItemStyle: styles.tabBarItem,
          tabBarBackground: () => (
            <View style={styles.blurContainer}>
              <BlurView
                tint="dark"
                intensity={50}
                style={StyleSheet.absoluteFill}
              />
            </View>
          ),
          // Adiciona configuração de animação para suavizar a transição
          animation: "fade",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
            tabBarButton: (props) => (
              <Pressable
                {...props}
                style={[props.style, styles.leftTabItem]}
                onPress={(e) => {
                  triggerHaptic();
                  props.onPress?.(e);
                }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="campanhas"
          options={{
            title: "Campanhas",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="megaphone" color={color} />
            ),
            tabBarButton: (props) => (
              <Pressable
                {...props}
                style={[props.style, styles.centerLeftTabItem]}
                onPress={(e) => {
                  triggerHaptic();
                  props.onPress?.(e);
                }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="blog"
          options={{
            title: "Blog",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="newspaper" color={color} />
            ),
            tabBarButton: (props) => (
              <Pressable
                {...props}
                style={[props.style, styles.centerRightTabItem]}
                onPress={(e) => {
                  triggerHaptic();
                  props.onPress?.(e);
                }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="person" color={color} />
            ),
            tabBarButton: (props) => (
              <Pressable
                {...props}
                style={[props.style, styles.rightTabItem]}
                onPress={(e) => {
                  triggerHaptic();
                  props.onPress?.(e);
                }}
              />
            ),
          }}
        />
      </Tabs>

      {/* Componente FAB contextual */}
      <FloatingActionButton />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    height: TABBAR_HEIGHT,
    alignSelf: "center",
    borderRadius: 50,
    backgroundColor: "rgba(2, 2, 2, 0.0)",
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingBottom: 0,
    paddingTop: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tabBarItem: {
    height: TABBAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    flex: 1,
  },
  leftTabItem: {
    marginRight: 10,
  },
  centerLeftTabItem: {
    marginRight: CENTER_GAP / 2, // Metade do espaço para o lado esquerdo
  },
  centerRightTabItem: {
    marginLeft: CENTER_GAP / 2, // Metade do espaço para o lado direito
  },
  rightTabItem: {
    marginLeft: 10,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    borderRadius: 50,
  },
});
