import React from "react";
import { Stack } from "expo-router";
import { CampanhaProvider } from "../../src/contexts/CampanhaContext";

/**
 * Layout para o grupo de rotas de campanhas
 */
export default function CampanhasLayout() {
  return (
    <CampanhaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Telas normais de fluxo */}
        <Stack.Screen
          name="spotify/index"
          options={{ title: "Campanha Spotify" }}
        />
        <Stack.Screen
          name="spotify/info"
          options={{ title: "Informações da Campanha" }}
        />
        <Stack.Screen
          name="spotify/configurar"
          options={{ title: "Configurar Campanha" }}
        />
        <Stack.Screen
          name="spotify/orcamento"
          options={{ title: "Orçamento da Campanha" }}
        />
        <Stack.Screen
          name="spotify/resumo"
          options={{ title: "Resumo da Campanha" }}
        />
        <Stack.Screen name="pagamento" options={{ title: "Pagamento" }} />
        <Stack.Screen
          name="resumo-pagamento"
          options={{ title: "Resumo do Pagamento" }}
        />
        <Stack.Screen name="pix-qrcode" options={{ title: "Pagamento PIX" }} />

        {/* Modal de detalhes da campanha */}
        <Stack.Screen
          name="detalhes/[id]"
          options={{
            title: "Detalhes da Campanha",
            presentation: "transparentModal",
            animation: "slide_from_bottom",
            animationDuration: 250,
            gestureEnabled: true,
            gestureDirection: "vertical",
            fullScreenGestureEnabled: true,
          }}
        />
      </Stack>
    </CampanhaProvider>
  );
}
