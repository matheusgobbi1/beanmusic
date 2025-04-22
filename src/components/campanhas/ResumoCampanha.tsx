import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCampanha } from "../../contexts/CampanhaContext";
import colors from "../../constants/colors";
import { SpotifyTrack } from "../../services/spotifyApi";

/**
 * Componente para exibir o resumo da campanha antes do pagamento
 */
const ResumoCampanha: React.FC = () => {
  const router = useRouter();
  const { state, goToStep } = useCampanha();
  const { selectedTrack, targetOptions, budget, observation, platform } = state;

  // Funções auxiliares para extrair informações da música de forma mais robusta
  // Extrai as informações da faixa de forma mais robusta, suportando múltiplos formatos
  const getTrackName = () => {
    if (!selectedTrack) return "Música selecionada";
    return selectedTrack.name || selectedTrack.title || "Música selecionada";
  };

  const getArtistName = () => {
    if (!selectedTrack) return "Artista";
    const track = selectedTrack as SpotifyTrack;

    // Verifica todas as possíveis localizações do nome do artista
    if (track.artist_name) {
      return track.artist_name;
    } else if (track.artist) {
      return typeof track.artist === "string"
        ? track.artist
        : track.artist.name || "Artista";
    } else if (track.artists && track.artists.length > 0) {
      return track.artists.map((a) => a.name).join(", ");
    }

    return "Artista";
  };

  const getAlbumImage = () => {
    if (!selectedTrack) return null;
    const track = selectedTrack as SpotifyTrack;

    // Verifica todas as possíveis localizações da imagem
    if (track.image) {
      return track.image;
    } else if (track.album?.images && track.album.images.length > 0) {
      return track.album.images[0]?.url;
    } else if (track.artwork) {
      return track.artwork;
    } else if (track.cover) {
      return track.cover;
    }

    return null;
  };

  // Obter informações processadas da música
  const trackName = getTrackName();
  const artistName = getArtistName();
  const albumImage = getAlbumImage();

  // Log para debug
  React.useEffect(() => {
    console.log("Informações da música na tela ResumoCampanha:", {
      trackName,
      artistName,
      hasImage: !!albumImage,
    });
  }, []);

  // Função para navegar para etapa específica para edição
  const handleEditStep = (step: number) => {
    goToStep(step);
    // Navegar para a tela correspondente
    switch (step) {
      case 1:
        router.push("/(campanhas)/spotify");
        break;
      case 2:
        router.push("/(campanhas)/spotify/info");
        break;
      case 3:
        router.push("/(campanhas)/spotify/configurar");
        break;
      case 4:
        router.push("/(campanhas)/spotify/orcamento");
        break;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Resumo da Campanha</Text>
      <Text style={styles.subtitle}>
        Revise os detalhes da sua campanha antes de continuar
      </Text>

      {/* Música selecionada */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Música</Text>
          <TouchableOpacity onPress={() => handleEditStep(1)}>
            <Text style={styles.editButton}>Editar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trackContainer}>
          {albumImage ? (
            <Image source={{ uri: albumImage }} style={styles.albumImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons
                name={"musical-notes-outline" as any}
                size={40}
                color={colors.text.disabled}
              />
            </View>
          )}

          <View style={styles.trackDetails}>
            <Text style={styles.trackName}>{trackName}</Text>
            <Text style={styles.artistName}>{artistName}</Text>
          </View>
        </View>
      </View>

      {/* Configurações de público-alvo */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Segmentação</Text>
          <TouchableOpacity onPress={() => handleEditStep(3)}>
            <Text style={styles.editButton}>Editar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.targetContainer}>
          <View style={styles.targetItem}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="musical-notes-outline"
                size={20}
                color={colors.primary.main}
              />
            </View>
            <View style={styles.targetInfo}>
              <Text style={styles.targetLabel}>Gênero Musical</Text>
              <Text style={styles.targetValue}>
                {targetOptions.genre || "Não especificado"}
              </Text>
            </View>
          </View>

          <View style={styles.targetItem}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="globe-outline"
                size={20}
                color={colors.primary.main}
              />
            </View>
            <View style={styles.targetInfo}>
              <Text style={styles.targetLabel}>Idioma</Text>
              <Text style={styles.targetValue}>
                {targetOptions.language || "Não especificado"}
              </Text>
            </View>
          </View>

          <View style={styles.targetItem}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="heart-outline"
                size={20}
                color={colors.primary.main}
              />
            </View>
            <View style={styles.targetInfo}>
              <Text style={styles.targetLabel}>Mood</Text>
              <Text style={styles.targetValue}>
                {targetOptions.mood || "Não especificado"}
              </Text>
            </View>
          </View>

          {observation && (
            <View style={styles.observationContainer}>
              <Text style={styles.observationLabel}>Observações</Text>
              <Text style={styles.observationText}>{observation}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Orçamento */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Orçamento</Text>
          <TouchableOpacity onPress={() => handleEditStep(4)}>
            <Text style={styles.editButton}>Editar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.budgetContainer}>
          <View style={styles.budgetAmountContainer}>
            <Text style={styles.budgetAmount}>
              R$ {budget?.toLocaleString("pt-BR") || "0"}
            </Text>
            <Text style={styles.budgetLabel}>Investimento total</Text>
          </View>

          <View style={styles.budgetDetailsContainer}>
            <View style={styles.budgetDetailItem}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="play-circle-outline"
                  size={20}
                  color={colors.primary.main}
                />
              </View>
              <View style={styles.budgetDetailContent}>
                <Text style={styles.budgetDetailLabel}>
                  Reproduções estimadas
                </Text>
                <Text style={styles.budgetDetailValue}>
                  {Math.round(budget * 3.5).toLocaleString("pt-BR")}+
                </Text>
              </View>
            </View>

            <View style={styles.budgetDetailItem}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={colors.primary.main}
                />
              </View>
              <View style={styles.budgetDetailContent}>
                <Text style={styles.budgetDetailLabel}>Duração estimada</Text>
                <Text style={styles.budgetDetailValue}>
                  {Math.round(budget / 50) + 3} dias
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Informações de pagamento */}
      <View style={styles.paymentInfoContainer}>
        <View style={styles.infoIconContainer}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.status.info.main}
          />
        </View>
        <View style={styles.paymentInfoContent}>
          <Text style={styles.paymentInfoText}>
            Após clicar em "Continuar", você será direcionado para a tela de
            pagamento para concluir sua campanha.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  section: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  editButton: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: "bold",
  },
  trackContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  albumImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  trackDetails: {
    flex: 1,
    marginLeft: 16,
  },
  trackName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 2,
  },
  artistName: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  targetContainer: {
    paddingBottom: 8,
  },
  targetItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  targetInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: "center",
  },
  targetLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  targetValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  observationContainer: {
    marginTop: 8,
    backgroundColor: colors.background.subtle,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  observationLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  observationText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary.light + "30",
    borderRadius: 16,
    marginRight: 4,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.status.info.main + "30",
    borderRadius: 16,
    marginRight: 4,
  },
  budgetContainer: {
    alignItems: "center",
  },
  budgetAmountContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  budgetAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary.main,
    marginBottom: 4,
  },
  budgetLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  budgetDetailsContainer: {
    width: "100%",
    backgroundColor: colors.background.subtle,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  budgetDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  budgetDetailContent: {
    flex: 1,
    marginLeft: 8,
  },
  budgetDetailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  budgetDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  paymentInfoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.status.info.dark + "20",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.status.info.dark + "40",
  },
  paymentInfoContent: {
    flex: 1,
  },
  paymentInfoText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: colors.background.paper,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border.light,
  },
});

export default ResumoCampanha;
