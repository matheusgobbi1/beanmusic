import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import ResumoCampanha from "../../../src/components/campanhas/ResumoCampanha";
import CampanhaLayout from "../../../src/components/campanhas/CampanhaLayout";
import { useCampanha } from "../../../src/contexts/CampanhaContext";
import colors from "../../../src/constants/colors";

/**
 * Quinta tela do fluxo de criação de campanha: Resumo
 * Exibe o resumo da campanha antes do pagamento
 */
export default function ResumoCampanhaScreen() {
  const router = useRouter();
  const { goToStep } = useCampanha();

  // Configurar o passo como 5 na inicialização
  React.useLayoutEffect(() => {
    goToStep(5);
  }, []);

  // Função para avançar para a tela de pagamento
  const handleNext = () => {
    router.push("/(campanhas)/pagamento");
  };

  return (
    <CampanhaLayout
      onNextPress={handleNext}
      nextButtonLabel="Ir para Pagamento"
    >
      <View style={styles.container}>
        <ResumoCampanha />
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
