import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCampanha } from "../../contexts/CampanhaContext";
import colors from "../../constants/colors";
import { SpotifyTrack } from "../../services/spotifyApi";

/**
 * Componente para exibir informações sobre como funciona a campanha
 */
const InfoCampanha: React.FC = () => {
  const { state } = useCampanha();
  const { selectedTrack, platform } = state;

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

  const trackName = getTrackName();
  const artistName = getArtistName();
  const albumImage = getAlbumImage();

  // Log para debug
  React.useEffect(() => {
    console.log("Informações da música na tela InfoCampanha:", {
      trackName,
      artistName,
      hasImage: !!albumImage,
    });
  }, []);

  // Título da plataforma
  const platformTitle = () => {
    switch (platform) {
      case "spotify":
        return "Spotify";
      case "youtube":
        return "YouTube";
      case "tiktok":
        return "TikTok";
      case "instagram":
        return "Instagram";
      default:
        return "Música";
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho com informações da música */}
      <View style={styles.trackHeader}>
        {albumImage ? (
          <Image source={{ uri: albumImage }} style={styles.albumImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons
              name="musical-notes"
              size={40}
              color={colors.text.disabled}
            />
          </View>
        )}

        <View style={styles.trackInfo}>
          <Text style={styles.trackName} numberOfLines={1}>
            {trackName}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {artistName}
          </Text>
        </View>
      </View>

      {/* Título da seção */}
      <Text style={styles.title}>
        Como funciona a campanha no {platformTitle()}
      </Text>

      {/* Informações sobre a campanha */}
      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <Ionicons
            name="musical-notes-outline"
            size={24}
            color={colors.primary.main}
            style={styles.infoIcon}
          />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Promoção Orgânica</Text>
            <Text style={styles.infoDescription}>
              Sua música será promovida de forma orgânica para ouvintes reais
              que se encaixam no seu público-alvo.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Ionicons
            name="people-outline"
            size={24}
            color={colors.primary.main}
            style={styles.infoIcon}
          />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Público Segmentado</Text>
            <Text style={styles.infoDescription}>
              Você poderá definir o gênero musical, idioma e mood para atingir o
              público ideal para sua música.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Ionicons
            name="stats-chart-outline"
            size={24}
            color={colors.primary.main}
            style={styles.infoIcon}
          />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Resultados Reais</Text>
            <Text style={styles.infoDescription}>
              Acompanhe o desempenho da sua campanha com relatórios detalhados
              sobre reproduções, salvamentos e inclusões em playlists.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoItem}>
          <Ionicons
            name="cash-outline"
            size={24}
            color={colors.primary.main}
            style={styles.infoIcon}
          />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Investimento Flexível</Text>
            <Text style={styles.infoDescription}>
              Você escolhe quanto deseja investir. O alcance da sua campanha
              será proporcional ao seu orçamento.
            </Text>
          </View>
        </View>
      </View>

      {/* Aviso importante */}
      <View style={styles.disclaimerCard}>
        <Ionicons
          name="alert-circle-outline"
          size={24}
          color={colors.status.warning.main}
          style={styles.disclaimerIcon}
        />
        <Text style={styles.disclaimerText}>
          A Bean Music não garante um número específico de reproduções ou
          salvamentos, pois trabalhamos apenas com promoção orgânica e legítima.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
    paddingTop: 16,
  },
  trackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
    padding: 16,
    backgroundColor: colors.background.subtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  albumImage: {
    width: 64,
    height: 64,
    borderRadius: 6,
  },
  placeholderImage: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: colors.background.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  trackInfo: {
    flex: 1,
    marginLeft: 16,
  },
  trackName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  infoItem: {
    flexDirection: "row",
    marginVertical: 8,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: 12,
  },
  disclaimerCard: {
    backgroundColor: colors.status.warning.dark + "30",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: colors.status.warning.dark + "40",
  },
  disclaimerIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: colors.status.warning.light,
    lineHeight: 20,
  },
});

export default InfoCampanha;
