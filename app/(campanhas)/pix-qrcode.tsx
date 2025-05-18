import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { useCampanha } from "../../src/contexts/CampanhaContext";
import colors from "../../src/constants/colors";

// Componente de tela de QR Code PIX
function PixQRCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state, resetCampaign } = useCampanha();
  const { budget, coupon_name, discountedAmount } = state;

  // Valores para exibição - usar valor com desconto se disponível
  const total = discountedAmount !== undefined ? discountedAmount : budget || 0;

  // Log para verificar se o cupom foi passado corretamente
  console.log("Cupom aplicado no PIX:", coupon_name);
  console.log("Valor original:", budget, "Valor com desconto:", discountedAmount);

  // Obter os dados do QR code dos parâmetros da rota
  const qrCodeImage = params.qrCodeImage as string;
  const qrCodeText = params.qrCodeText as string;
  const campaignId = params.campaignId as string;

  // Tempo de expiração do PIX (10 minutos)
  const [timeLeft, setTimeLeft] = React.useState(600); // 10 minutos em segundos

  React.useEffect(() => {
    // Configurar contador
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formatar o tempo restante
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Função para copiar o código PIX
  const handleCopyPixCode = async () => {
    await Clipboard.setStringAsync(qrCodeText);
    Alert.alert(
      "Código PIX copiado",
      "O código PIX foi copiado para a área de transferência."
    );
  };

  // Função para compartilhar o código PIX
  const handleSharePixCode = async () => {
    try {
      await Share.share({
        message: `Código PIX para pagamento: ${qrCodeText}`,
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  // Função para fechar e voltar à tela inicial depois de concluir o pagamento
  const handleConcluir = () => {
    Alert.alert(
      "Pagamento Concluído",
      "Sua campanha foi criada com sucesso! Você receberá atualizações sobre o desempenho.",
      [
        {
          text: "OK",
          onPress: () => {
            // Reseta o estado da campanha e retorna para a tela inicial
            resetCampaign();
            router.push("/tabs");
          },
        },
      ]
    );
  };

  // Função para voltar
  const handleVoltar = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleVoltar}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagamento PIX</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.qrContainer}>
            <View style={styles.qrCode}>
              {qrCodeImage ? (
                <Image
                  source={{ uri: qrCodeImage }}
                  style={styles.qrCodeImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary.main} />
                  <Text style={styles.loadingText}>Carregando QR Code...</Text>
                </View>
              )}
            </View>

            <Text style={styles.expirationText}>
              Expira em <Text style={styles.timerText}>{formatTimeLeft()}</Text>
            </Text>

            {discountedAmount !== undefined && discountedAmount !== budget ? (
              <View style={styles.discountContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Subtotal:</Text>
                  <Text style={styles.originalAmount}>
                    R$ {budget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Desconto:</Text>
                  <Text style={styles.discountAmount}>
                    -R$ {(budget - discountedAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabelTotal}>Total:</Text>
                  <Text style={styles.amountText}>
                    R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.amountText}>
                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </Text>
            )}
            
            {coupon_name && (
              <View style={styles.couponBadge}>
                <Ionicons name="pricetag-outline" size={14} color={colors.text.onDark} />
                <Text style={styles.couponBadgeText}>Cupom {coupon_name} aplicado</Text>
              </View>
            )}
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Como pagar:</Text>
            <Text style={styles.instructionsText}>
              1. Abra o aplicativo do seu banco
            </Text>
            <Text style={styles.instructionsText}>
              2. Escolha a opção de pagamento por PIX
            </Text>
            <Text style={styles.instructionsText}>
              3. Escaneie o código QR ou copie e cole o código
            </Text>
            <Text style={styles.instructionsText}>
              4. Confirme o pagamento no seu app bancário
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyPixCode}
            >
              <Ionicons
                name="copy-outline"
                size={20}
                color={colors.text.onDark}
              />
              <Text style={styles.buttonText}>Copiar Código</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleSharePixCode}
            >
              <Ionicons
                name="share-social-outline"
                size={20}
                color={colors.text.onDark}
              />
              <Text style={styles.buttonText}>Compartilhar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConcluir}
          >
            <Text style={styles.confirmButtonText}>Já paguei</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default PixQRCodeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  qrCode: {
    backgroundColor: colors.background.paper,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
    width: 250,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  qrCodeImage: {
    width: 220,
    height: 220,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.text.secondary,
  },
  expirationText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  timerText: {
    fontWeight: "bold",
    color: colors.status.error.main,
  },
  discountContainer: {
    alignItems: "center",
    width: "100%",
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  priceLabelTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  originalAmount: {
    fontSize: 14,
    color: colors.text.disabled,
    textDecorationLine: "line-through",
  },
  discountAmount: {
    fontSize: 14,
    color: colors.status.success.main,
    fontWeight: "bold",
  },
  amountText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  couponBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  couponBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text.onDark,
    marginLeft: 4,
  },
  instructions: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
  },
  copyButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 8,
  },
  shareButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: colors.text.onDark,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: colors.status.success.main,
    borderRadius: 8,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
  },
  confirmButtonText: {
    color: colors.text.onDark,
    fontSize: 16,
    fontWeight: "bold",
  },
});
