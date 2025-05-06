import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import colors from "../../../src/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { campanhasAPI } from "../../../src/services/api";
import PlaylistCard, {
  Playlist,
} from "../../../src/components/campanhas/PlaylistCard";
import AtividadeStep, {
  Atividade,
} from "../../../src/components/campanhas/AtividadeStep";

// Habilitar LayoutAnimation no Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Interface para os detalhes da campanha
interface CampanhaDetalhes {
  id: string;
  title: string;
  platform: string;
  status: string;
  date: string;
  imageUrl?: string;
  artist?: string;
  description?: string;
  atividades?: Atividade[];
  playlists?: Playlist[];
}

// Mapeamento de status
const statusInfo = {
  pending: {
    color: colors.status.warning.main,
    text: "Pendente",
    icon: "time-outline" as const,
  },
  active: {
    color: colors.status.success.main,
    text: "Ativa",
    icon: "checkmark-circle-outline" as const,
  },
  completed: {
    color: colors.status.info.main,
    text: "Concluída",
    icon: "trophy-outline" as const,
  },
  rejected: {
    color: colors.status.error.main,
    text: "Rejeitada",
    icon: "close-circle-outline" as const,
  },
};

// Mapeamento de plataformas
const platformInfo = {
  spotify: {
    color: "#1DB954",
    icon: "spotify" as const,
    label: "Spotify",
  },
  youtube: {
    color: "#FF0000",
    icon: "youtube-play" as const,
    label: "YouTube",
  },
  tiktok: {
    color: "#000000",
    icon: "music" as const,
    label: "TikTok",
  },
  instagram: {
    color: "#C13584",
    icon: "instagram" as const,
    label: "Instagram",
  },
};

export default function DetalhesScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const router = useRouter();

  // Configuração da tela como modal
  React.useLayoutEffect(() => {
    router.setParams({
      modal: "true",
    });
  }, [router]);

  // Extrair o status real da string HTML (ex: <span class='badge rounded-pill bg-dark'>Finalizada</span>)
  const extrairTextoDeHTML = (html: string) => {
    if (!html) return "";
    const match = html.match(/>([^<]+)</);
    return match ? match[1] : html.replace(/<[^>]*>/g, "");
  };

  // Mapear o status do backend para os valores esperados pelo frontend
  const mapearStatus = (statusBackend: string): string => {
    if (!statusBackend) return "pending";

    // Extrair o texto do status se vier em formato HTML
    const statusTexto = extrairTextoDeHTML(statusBackend).toLowerCase();

    if (statusTexto.includes("finalizada")) return "completed";
    if (statusTexto.includes("ativa") || statusTexto.includes("em andamento"))
      return "active";
    if (statusTexto.includes("pendente") || statusTexto.includes("aguardando"))
      return "pending";
    if (statusTexto.includes("recusada") || statusTexto.includes("rejeitada"))
      return "rejected";

    return "pending"; // valor padrão
  };

  // Adaptar os dados da API para o formato esperado pelo frontend
  const adaptarDadosAPI = (dados: any): CampanhaDetalhes => {
    // Os dados vêm dentro de um objeto "data"
    const dadosReais = dados.data || dados;

    // Objeto base com dados da campanha
    const campanha: CampanhaDetalhes = {
      id: dadosReais.id || id,
      title:
        dadosReais.track_name || dadosReais.name || "Título não disponível",
      platform: "spotify", // Por enquanto só temos campanhas do Spotify
      status: mapearStatus(dadosReais.status),
      date: dadosReais.created_at || new Date().toLocaleDateString(),
      imageUrl: dadosReais.image,
      artist: dadosReais.artist_name,
      description: `Campanha para a música ${
        dadosReais.track_name || dadosReais.name
      } no Spotify.`,
      atividades: [],
      playlists: [],
    };

    // Adaptar atividades se existirem
    if (Array.isArray(dadosReais.activitys)) {
      campanha.atividades = dadosReais.activitys.map(
        (atividade: any, index: number) => {
          return {
            id: atividade.log_causer || String(index + 1),
            titulo: atividade.log_name || "Atividade",
            data: atividade.log_at || new Date().toLocaleDateString(),
            status:
              index === dadosReais.activitys.length - 1
                ? "current"
                : "completed",
            descricao: atividade.log_description || "",
          };
        }
      );
    }

    // Adaptar reviews para playlists se existirem
    if (Array.isArray(dadosReais.reviews)) {
      campanha.playlists = dadosReais.reviews.map((review: any) => {
        // Processar a nota
        const nota =
          typeof review.stars === "number"
            ? review.stars
            : parseFloat(review.stars) || 0;

        // Processar o nome do curador
        let curador = "";
        if (review["user.name"]) {
          curador =
            typeof review["user.name"] === "string"
              ? review["user.name"]
              : JSON.stringify(review["user.name"]);
        } else if (review.user && review.user.name) {
          curador = review.user.name;
        }

        // Processar seguidores
        const seguidores =
          typeof review.followers === "string"
            ? review.followers
            : String(review.followers || 0);

        // Extrair o status da playlist
        const status = review.status ? extrairTextoDeHTML(review.status) : "";

        return {
          id: review.id || String(Math.random()),
          nome: review.playlist_name || "Playlist",
          imageUrl:
            review.image ||
            "https://i.scdn.co/image/ab67706c0000bebb646704f4dccd6349438328bf",
          seguidores: seguidores,
          aceitouEm: review.created_at || new Date().toLocaleDateString(),
          nota: nota,
          avaliacao: review.observations || "",
          curador: curador,
          status: status,
        };
      });
    }

    return campanha;
  };

  // Busca de dados da API com React Query
  const { data, isLoading, error } = useQuery<CampanhaDetalhes>({
    queryKey: ["campanha", id],
    queryFn: async () => {
      try {
        const response = await campanhasAPI.getCampaignDetails(id);
        return adaptarDadosAPI(response);
      } catch (error) {
        console.error("[API] Erro ao buscar detalhes da campanha:", error);
        throw error;
      }
    },
  });

  const handleClose = () => {
    router.back();
  };

  // Renderizar indicador de carregamento
  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            animationDuration: 250,
            gestureEnabled: true,
            gestureDirection: "vertical",
          }}
        />
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>
            Carregando detalhes da campanha...
          </Text>
        </SafeAreaView>
      </>
    );
  }

  // Renderizar mensagem de erro
  if (error || !data) {
    return (
      <>
        <Stack.Screen
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            animationDuration: 250,
            gestureEnabled: true,
            gestureDirection: "vertical",
          }}
        />
        <SafeAreaView style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.status.error.main}
          />
          <Text style={styles.errorText}>Erro ao carregar detalhes</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleClose}>
            <Text style={styles.retryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </>
    );
  }

  const statusConfig =
    statusInfo[data.status as keyof typeof statusInfo] || statusInfo.pending;
  const platformConfig =
    platformInfo[data.platform as keyof typeof platformInfo] ||
    platformInfo.spotify;

  // Converte objetos para string se necessário para evitar erros de renderização
  const sanitizeText = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean")
      return String(value);
    return JSON.stringify(value);
  };

  return (
    <>
      <Stack.Screen
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          animationDuration: 250,
          gestureEnabled: true,
          gestureDirection: "vertical",
        }}
      />

      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes da Campanha</Text>
          <View style={styles.placeholderRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Imagem de capa */}
          <View style={styles.imageContainer}>
            {data.imageUrl ? (
              <Image
                source={{ uri: data.imageUrl }}
                style={styles.coverImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons
                  name="musical-notes"
                  size={48}
                  color={colors.primary.light}
                />
              </View>
            )}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.imageShadow}
            />
            <View style={styles.imageOverlay}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: platformConfig.color },
                ]}
              >
                <FontAwesome
                  name={platformConfig.icon}
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.badgeText}>{platformConfig.label}</Text>
              </View>
            </View>
          </View>

          {/* Informações principais */}
          <View style={styles.infoSection}>
            <Text style={styles.title}>{sanitizeText(data.title)}</Text>
            {data.artist && (
              <Text style={styles.artist}>{sanitizeText(data.artist)}</Text>
            )}

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${statusConfig.color}20` },
                ]}
              >
                <Ionicons
                  name={statusConfig.icon}
                  size={16}
                  color={statusConfig.color}
                />
                <Text
                  style={[styles.statusText, { color: statusConfig.color }]}
                >
                  {statusConfig.text}
                </Text>
              </View>
              <Text style={styles.date}>{sanitizeText(data.date)}</Text>
            </View>

            {/* Descrição */}
            {data.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Descrição</Text>
                <Text style={styles.description}>
                  {sanitizeText(data.description)}
                </Text>
              </View>
            )}

            {/* Timeline de Atividades */}
            {data.atividades && data.atividades.length > 0 && (
              <View style={styles.timelineSection}>
                <Text style={styles.sectionTitle}>Histórico de Atividades</Text>
                <View style={styles.timelineContainer}>
                  {data.atividades.map((atividade, index) => (
                    <AtividadeStep
                      key={atividade.id}
                      atividade={atividade}
                      isLast={index === data.atividades!.length - 1}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Playlists */}
            {data.playlists && data.playlists.length > 0 && (
              <View style={styles.playlistsSection}>
                <Text style={styles.sectionTitle}>Playlists Avaliadas</Text>
                <View style={styles.playlistsContainer}>
                  {data.playlists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  placeholderRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 280,
    position: "relative",
    backgroundColor: colors.background.subtle,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: `${colors.primary.main}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  imageShadow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  imageOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  infoSection: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 24,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  date: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },

  // Timeline styles
  timelineSection: {
    marginBottom: 24,
  },
  timelineContainer: {
    paddingLeft: 8,
  },
  stepContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  stepIconContainer: {
    alignItems: "center",
    marginRight: 12,
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
    marginBottom: -4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 8,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  stepDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  // Playlist card styles
  playlistsSection: {
    marginBottom: 24,
  },
  playlistsContainer: {
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.default,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background.default,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.primary.contrast,
    fontWeight: "500",
  },
});
