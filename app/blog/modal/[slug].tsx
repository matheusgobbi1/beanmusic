import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import ExibeNoticia from "../../../src/components/blog/ExibeNoticia"; // Ajuste o caminho conforme necessário
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../../src/constants/colors"; // Ajuste o caminho conforme necessário

export default function NoticiaModalScreen(): React.JSX.Element {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  // Definindo um título dinâmico ou um fallback
  const screenTitle = slug ? "Detalhes da Notícia" : "Notícia";

  if (!slug) {
    // Idealmente, isso não deveria acontecer se a navegação estiver correta
    // Pode adicionar um componente de erro ou fallback aqui
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Stack.Screen options={{ title: "Erro", presentation: "modal" }} />
          <Text style={styles.errorText}>Slug da notícia não fornecido.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <Stack.Screen
        options={{
          title: screenTitle,
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <View style={styles.container}>
        <ExibeNoticia slug={slug} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  container: {
    flex: 1,
    // O padding pode ser adicionado aqui ou dentro de ExibeNoticia,
    // dependendo se a modal deve ter seu próprio padding ou se o conteúdo controla.
    // padding: 16,
  },
  errorText: {
    color: colors.status.error.main,
    textAlign: "center",
    marginTop: 20,
  },
});
