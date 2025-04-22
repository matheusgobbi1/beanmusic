import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import ConfigurarCampanha from "../../../src/components/campanhas/ConfigurarCampanha";
import CampanhaLayout from "../../../src/components/campanhas/CampanhaLayout";
import { useCampanha } from "../../../src/contexts/CampanhaContext";
import colors from "../../../src/constants/colors";

/**
 * Terceira tela do fluxo de criação de campanha: Configuração
 * Permite configurar gênero, idioma, mood e observações
 * Utiliza FlatLists horizontais para seleção de opções
 */
export default function ConfigurarCampanhaScreen() {
  const router = useRouter();
  const { state, goToStep } = useCampanha();

  // Configurar o passo como 3 na inicialização
  React.useLayoutEffect(() => {
    goToStep(3);
  }, []);

  // Verifica se o usuário selecionou pelo menos um gênero, um idioma e três moods
  const isNextDisabled = React.useMemo(() => {
    const { genre, language, mood } = state.targetOptions;

    const hasGenre = !!genre;
    const hasLanguage = !!language;
    const hasThreeMoods = Array.isArray(mood) && mood.length >= 3;

    return !hasGenre || !hasLanguage || !hasThreeMoods;
  }, [state.targetOptions]);

  // Função para avançar para a próxima etapa
  const handleNext = () => {
    router.push("/(campanhas)/spotify/orcamento");
  };

  return (
    <CampanhaLayout onNextPress={handleNext} nextDisabled={isNextDisabled}>
      <View style={styles.container}>
        <ConfigurarCampanha />
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
