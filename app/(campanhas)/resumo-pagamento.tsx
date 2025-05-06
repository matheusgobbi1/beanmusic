import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCampanha } from "../../src/contexts/CampanhaContext";
import Button from "../../src/components/common/Button";
import colors from "../../src/constants/colors";
import { campanhasAPI } from "../../src/services/api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "@env";

export default function ResumoPagamentoScreen() {
  const router = useRouter();
  const { state } = useCampanha();
  const { selectedTrack, budget, targetOptions, observation, platform } = state;
  const [loading, setLoading] = useState(false);

  // Constantes para calcular valores
  const subtotal = budget || 0;
  const taxa = subtotal * 0.05; // 5% de taxa
  const total = subtotal + taxa;

  // Função para obter o nome da música
  const getTrackName = () => {
    if (!selectedTrack) return "Música selecionada";
    return selectedTrack.name || selectedTrack.title || "Música selecionada";
  };

  // Função para obter o nome do artista
  const getArtistName = () => {
    if (!selectedTrack) return "Artista";

    if (selectedTrack.artist_name) {
      return selectedTrack.artist_name;
    } else if (selectedTrack.artist) {
      return typeof selectedTrack.artist === "string"
        ? selectedTrack.artist
        : selectedTrack.artist.name || "Artista";
    } else if (selectedTrack.artists && selectedTrack.artists.length > 0) {
      return selectedTrack.artists
        .map((a: { name: string }) => a.name)
        .join(", ");
    }

    return "Artista";
  };

  // Função para obter a imagem do álbum
  const getAlbumImage = () => {
    if (!selectedTrack) return null;

    if (selectedTrack.image) {
      return selectedTrack.image;
    } else if (
      selectedTrack.album?.images &&
      selectedTrack.album.images.length > 0
    ) {
      return selectedTrack.album.images[0]?.url;
    } else if (selectedTrack.artwork) {
      return selectedTrack.artwork;
    } else if (selectedTrack.cover) {
      return selectedTrack.cover;
    }

    return null;
  };

  // Função para gerar PIX e navegar para a tela do QR Code
  const handleConfirmarPagamento = async () => {
    try {
      setLoading(true);

      // Obter token de autenticação
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        Alert.alert("Erro", "Você precisa estar autenticado para continuar.");
        setLoading(false);
        return;
      }

      // Preparar os dados da campanha - Simplificando para corresponder ao exemplo anterior
      const requestData = {
        budget: total, // Valor total com taxa
        platform,
        track_id: selectedTrack?.id,
        track_name: getTrackName(),
        artist_name: getArtistName(),
        target_options: targetOptions,
        observation,
      };

      // Chamada direta à API usando axios em vez de utilizar a campanhasAPI
      const response = await axios.post(`${API_URL}/campaigns`, requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Resposta da API (Campanha criada):", response.data);

      // Verificar estrutura da resposta para obter dados do QR code
      const responseData = response.data.data || response.data;
      const qrCodeImage = responseData?.payment?.method?.qrcode;
      const qrCodeText = responseData?.payment?.method?.qrcode_text;
      const campaignId = responseData?.id;

      if (!qrCodeImage || !qrCodeText) {
        throw new Error("QR Code não disponível na resposta da API.");
      }

      // Navegar para a tela do QR Code com os dados retornados
      router.push({
        pathname: "/(campanhas)/pix-qrcode",
        params: {
          qrCodeImage,
          qrCodeText,
          campaignId,
        },
      });
    } catch (error) {
      console.error("Erro ao criar campanha:", error);

      // Log detalhado para diagnóstico
      if (axios.isAxiosError(error)) {
        console.error("Detalhes do erro:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config,
        });
      }

      Alert.alert(
        "Erro",
        "Não foi possível criar a campanha. Por favor, tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  // Função para voltar para a tela de pagamento
  const handleVoltar = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleVoltar}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Resumo do Pagamento</Text>
          </View>

          {/* Track escolhida */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Música</Text>
            <View style={styles.trackContainer}>
              {getAlbumImage() ? (
                <Image
                  source={{ uri: getAlbumImage() }}
                  style={styles.albumImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons
                    name="musical-notes-outline"
                    size={32}
                    color={colors.text.disabled}
                  />
                </View>
              )}
              <View style={styles.trackInfo}>
                <Text style={styles.trackName}>{getTrackName()}</Text>
                <Text style={styles.artistName}>{getArtistName()}</Text>
              </View>
            </View>
          </View>

          {/* Método de pagamento */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
            <View style={styles.paymentMethodCard}>
              <Ionicons
                name="qr-code-outline"
                size={24}
                color={colors.primary.main}
              />
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>PIX</Text>
                <Text style={styles.paymentMethodDescription}>
                  Pagamento instantâneo via QR Code
                </Text>
              </View>
            </View>
          </View>

          {/* Resumo de valores */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo da Compra</Text>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  R${" "}
                  {subtotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxa de serviço (5%)</Text>
                <Text style={styles.summaryValue}>
                  R${" "}
                  {taxa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRowTotal}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  R${" "}
                  {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer com botão fixo */}
        <View style={styles.footer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary.main} />
          ) : (
            <Button
              title="Confirmar e Gerar PIX"
              onPress={handleConfirmarPagamento}
              variant="primary"
              size="large"
              fullWidth
              icon="qr-code-outline"
              iconPosition="right"
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 12,
    color: colors.text.primary,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.text.primary,
  },
  trackContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  albumImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.background.default,
    justifyContent: "center",
    alignItems: "center",
  },
  trackInfo: {
    marginLeft: 16,
    flex: 1,
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
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.background.default,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  paymentMethodInfo: {
    marginLeft: 16,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  summaryContainer: {
    backgroundColor: colors.background.default,
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.ui.divider,
    marginVertical: 12,
  },
  summaryRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary.main,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});
