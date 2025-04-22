import React, { useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import BuscarMusica from "../../../src/components/campanhas/BuscarMusica";
import CampanhaLayout from "../../../src/components/campanhas/CampanhaLayout";
import { useCampanha } from "../../../src/contexts/CampanhaContext";
import colors from "../../../src/constants/colors";
import { SpotifyTrack } from "../../../src/services/spotifyApi";

/**
 * Primeira tela do fluxo de criação de campanha do Spotify
 * Permite buscar e selecionar uma música
 */
export default function SpotifyCampanhaScreen() {
  const router = useRouter();
  const { setPlatform, setSelectedTrack, goToStep, state } = useCampanha();
  const [trackSelected, setTrackSelected] = React.useState(false);

  // Extrai apenas o ID da faixa selecionada para minimizar re-renderizações
  const selectedTrackId = useMemo(
    () => state.selectedTrack?.id,
    [state.selectedTrack?.id]
  );

  // Define a plataforma como Spotify e reinicia para a etapa 1 na inicialização
  React.useLayoutEffect(() => {
    setPlatform("spotify");
    goToStep(1);
  }, []);

  // Função para marcar uma música como selecionada usando useCallback para memoização
  const handleSelectTrack = useCallback(
    (track: SpotifyTrack) => {
      setSelectedTrack(track);
      setTrackSelected(true);
    },
    [setSelectedTrack]
  );

  // Função para navegar para a próxima tela quando o botão continuar for pressionado
  const handleContinue = useCallback(() => {
    router.push("/(campanhas)/spotify/info");
  }, [router]);

  return (
    <CampanhaLayout
      hideNextButton={!trackSelected}
      onNextPress={handleContinue}
      nextButtonLabel="Continuar"
    >
      <View style={styles.container}>
        <BuscarMusica
          onSelectTrack={handleSelectTrack}
          selectedTrackId={selectedTrackId}
        />
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
