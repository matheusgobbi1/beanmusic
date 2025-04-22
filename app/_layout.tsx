import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { AuthProvider } from "../src/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { isAuthenticated } from "../src/services/authService";
import { StatusBar } from "expo-status-bar";
import colors from "../src/constants/colors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Criar uma instância do QueryClient
const queryClient = new QueryClient();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // Verificar estado de autenticação ao iniciar o app
  const init = useCallback(async () => {
    try {
      const authStatus = await isAuthenticated();
      // Definir rota inicial com base no status da autenticação
      setInitialRoute(authStatus ? "(tabs)" : "(auth)");
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      setInitialRoute("(auth)");
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  // Esperar até que o aplicativo esteja pronto
  if (!isReady || !initialRoute) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              animationDuration: 200,
              contentStyle: { backgroundColor: colors.background.default },
            }}
            initialRouteName={initialRoute}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
            <Stack.Screen name="(campanhas)" />
            <Stack.Screen
              name="transacoes"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
                animationDuration: 250,
                gestureEnabled: true,
                gestureDirection: "vertical",
              }}
            />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
