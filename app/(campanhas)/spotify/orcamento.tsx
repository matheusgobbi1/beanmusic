import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import OrcamentoCampanha from "../../../src/components/campanhas/OrcamentoCampanha";
import CampanhaLayout from "../../../src/components/campanhas/CampanhaLayout";
import { useCampanha } from "../../../src/contexts/CampanhaContext";
import colors from "../../../src/constants/colors";

/**
 * Quarta tela do fluxo de criação de campanha: Orçamento
 * Permite definir o valor do investimento na campanha
 */
export default function OrcamentoCampanhaScreen() {
  const router = useRouter();
  const { state, goToStep } = useCampanha();

  // Configurar o passo como 4 na inicialização
  React.useLayoutEffect(() => {
    goToStep(4);
  }, []);

  // Verifica se o orçamento foi definido
  const isNextDisabled = React.useMemo(() => {
    return !state.budget || state.budget <= 0;
  }, [state.budget]);

  // Função para avançar para a próxima etapa
  const handleNext = () => {
    router.push("/(campanhas)/spotify/resumo");
  };

  return (
    <CampanhaLayout onNextPress={handleNext} nextDisabled={isNextDisabled}>
      <View style={styles.container}>
        <OrcamentoCampanha />
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
