import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import InfoCampanha from "../../../src/components/campanhas/InfoCampanha";
import CampanhaLayout from "../../../src/components/campanhas/CampanhaLayout";
import { useCampanha } from "../../../src/contexts/CampanhaContext";
import colors from "../../../src/constants/colors";

/**
 * Segunda tela do fluxo de criação de campanha: Informações
 * Explica como funciona a campanha para o usuário
 */
export default function InfoCampanhaScreen() {
  const router = useRouter();
  const { state, goToStep, nextStep } = useCampanha();

  // Configurando o passo como 2 e verificando se existe uma faixa selecionada
  React.useLayoutEffect(() => {
    goToStep(2);

    if (!state.selectedTrack) {
      Alert.alert(
        "Nenhuma música selecionada",
        "Você precisa selecionar uma música antes de continuar.",
        [
          {
            text: "Voltar",
            onPress: () => router.replace("/(campanhas)/spotify"),
          },
        ]
      );
    }

    // Log para debug
    console.log("Música selecionada na tela info:", state.selectedTrack);
  }, []);

  // Função para avançar para a próxima etapa
  const handleNext = () => {
    if (!state.selectedTrack) {
      Alert.alert(
        "Selecione uma música",
        "Você precisa selecionar uma música antes de prosseguir.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(campanhas)/spotify"),
          },
        ]
      );
      return;
    }
    router.push("/(campanhas)/spotify/configurar");
  };

  return (
    <CampanhaLayout onNextPress={handleNext}>
      <View style={styles.container}>
        <InfoCampanha />
      </View>
    </CampanhaLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
});
