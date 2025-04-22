import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCampanha } from "../../contexts/CampanhaContext";
import {
  searchTracks,
  SpotifyTrack,
  formatDuration,
} from "../../services/spotifyApi";
import colors from "../../constants/colors";

// Função para enriquecer os resultados com dados adicionais quando necessário (temporário)
const enrichTrackData = (tracks: SpotifyTrack[]): SpotifyTrack[] => {
  return tracks.map((track) => {
    // Se já tem dados completos, retorna como está
    if (
      track.artists &&
      track.artists.length > 0 &&
      track.album?.images &&
      track.album.images.length > 0 &&
      track.artist_name
    ) {
      return track;
    }

    // Caso contrário, adiciona informações fictícias
    return {
      ...track,
      artists:
        track.artists && track.artists.length > 0
          ? track.artists
          : [{ id: "unknown", name: "Artista " + track.name }],
      album: {
        ...track.album,
        name: track.album?.name || track.name + " - Álbum",
        images:
          track.album?.images && track.album.images.length > 0
            ? track.album.images
            : [
                {
                  url: "https://via.placeholder.com/300",
                  height: 300,
                  width: 300,
                },
              ],
      },
      artist_name: track.artist_name || "Artista " + track.name,
      image: track.image || "https://via.placeholder.com/300",
    };
  });
};

interface BuscarMusicaProps {
  onSelectTrack?: (track: SpotifyTrack) => void;
  selectedTrackId?: string;
}

/**
 * Componente para buscar e selecionar músicas do Spotify
 * Memoizado para evitar renderizações desnecessárias
 */
const BuscarMusica: React.FC<BuscarMusicaProps> = React.memo(
  ({ onSelectTrack, selectedTrackId }) => {
    // Estados locais
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SpotifyTrack[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [searched, setSearched] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedTrack, setSelectedTrackLocal] = React.useState<
      string | null
    >(selectedTrackId || null);

    // Acesso ao contexto
    const { setSelectedTrack: setGlobalSelectedTrack } = useCampanha();

    // Função para realizar a busca - memoizada para evitar recriações
    const handleSearch = useCallback(async () => {
      if (query.trim().length === 0) return;

      setLoading(true);
      setSearched(true);
      setError(null);

      try {
        const response = await searchTracks(query);

        // Enriquece os dados com informações adicionais quando necessário
        const enrichedTracks = enrichTrackData(response.tracks);
        setResults(enrichedTracks);

        // Se não encontrou resultados, mostra uma mensagem
        if (response.tracks.length === 0) {
          setError("Nenhuma música encontrada. Tente outra busca.");
        }
      } catch (error) {
        console.error(error);
        setError(
          "Ocorreu um erro ao buscar músicas. Tente novamente mais tarde."
        );
      } finally {
        setLoading(false);
      }
    }, [query]);

    // Seleciona uma faixa - memoizada
    const handleSelectTrack = useCallback(
      (track: SpotifyTrack) => {
        setSelectedTrackLocal(track.id);
        setGlobalSelectedTrack(track);

        // Se a prop onSelectTrack foi fornecida, chama ela também
        if (onSelectTrack) {
          onSelectTrack(track);
        }
      },
      [onSelectTrack, setGlobalSelectedTrack]
    );

    // Renderiza cada item da lista de resultados - memoizado
    const renderTrackItem = useCallback(
      ({ item }: { item: SpotifyTrack }) => {
        // Suporta formato antigo (track.image) e novo (track.album.images)
        let albumImage = "";

        // Tenta todas as possíveis fontes de imagem
        if (item.image) {
          albumImage = item.image;
        } else if (item.album?.images && item.album.images.length > 0) {
          albumImage = item.album.images[0]?.url || "";
        }

        // Suporta ambos os formatos para o nome do artista
        let artistNames = "Artista desconhecido";

        // Tenta todas as possíveis fontes do nome do artista
        if (item.artist_name) {
          artistNames = item.artist_name;
        } else if (item.artists && item.artists.length > 0) {
          artistNames = item.artists.map((artist) => artist.name).join(", ");
        }

        // Verifica se este item está selecionado
        const isSelected = selectedTrack === item.id;

        return (
          <TouchableOpacity
            style={[styles.trackItem, isSelected && styles.selectedTrackItem]}
            onPress={() => handleSelectTrack(item)}
            activeOpacity={0.7}
          >
            {/* Imagem do álbum */}
            <Image
              source={
                albumImage
                  ? { uri: albumImage }
                  : require("../../../assets/images/placeholder-album.png")
              }
              style={styles.albumImage}
            />

            {/* Informações da faixa */}
            <View style={styles.trackInfo}>
              <Text style={styles.trackName} numberOfLines={1}>
                {item.name || "Faixa desconhecida"}
              </Text>
              <Text style={styles.artistName} numberOfLines={1}>
                {artistNames}
              </Text>
              <Text style={styles.albumName} numberOfLines={1}>
                {item.album?.name || "Álbum desconhecido"}
              </Text>
            </View>

            {/* Duração */}
            <View style={styles.durationContainer}>
              <Text style={styles.duration}>
                {formatDuration(item.duration_ms)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      },
      [selectedTrack, handleSelectTrack]
    );

    // Renderiza mensagem quando não há resultados - memoizado
    const renderEmptyList = useCallback(() => {
      if (!searched) return null;

      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="search-outline"
            size={48}
            color={colors.text.disabled}
          />
          <Text style={styles.emptyText}>
            {error || `Nenhuma música encontrada para "${query}"`}
          </Text>
        </View>
      );
    }, [searched, error, query]);

    // Memoiza o keyExtractor para evitar recriação
    const keyExtractor = useCallback((item: SpotifyTrack) => item.id, []);

    return (
      <View style={styles.container}>
        {/* Título da seção */}
        <Text style={styles.title}>Buscar Música</Text>
        <Text style={styles.subtitle}>
          Encontre a música que você deseja promover
        </Text>

        {/* Campo de busca */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar música ou artista"
            placeholderTextColor={colors.text.disabled}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Indicador de carregamento */}
        {loading && (
          <ActivityIndicator
            size="large"
            color={colors.primary.main}
            style={styles.loadingIndicator}
          />
        )}

        {/* Lista de resultados */}
        {!loading && (
          <FlatList
            data={results}
            renderItem={renderTrackItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.resultsList}
            ListEmptyComponent={renderEmptyList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
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
  searchContainer: {
    flexDirection: "row",
    borderColor: colors.border.main,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    color: colors.text.primary,
    backgroundColor: colors.background.inputField,
  },
  searchButton: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.inputField,
  },
  loadingIndicator: {
    marginTop: 24,
  },
  resultsList: {
    paddingBottom: 80,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.background.subtle,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectedTrackItem: {
    borderColor: colors.primary.main,
    borderWidth: 2,
    backgroundColor: `${colors.primary.main}10`,
  },
  albumImage: {
    width: 56,
    height: 56,
    borderRadius: 4,
    backgroundColor: colors.background.subtle,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  trackName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  albumName: {
    fontSize: 12,
    color: colors.text.hint,
  },
  durationContainer: {
    paddingLeft: 8,
    alignItems: "flex-end",
  },
  duration: {
    fontSize: 12,
    color: colors.text.hint,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.disabled,
    textAlign: "center",
  },
});

export default BuscarMusica;
