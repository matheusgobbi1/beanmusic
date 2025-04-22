import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import PaymentScreen, {
  PaymentMethod,
} from "../../src/components/common/PaymentScreen";
import { useCampanha } from "../../src/contexts/CampanhaContext";
import Button from "../../src/components/common/Button";
import colors from "../../src/constants/colors";

/**
 * Tela de pagamento
 * Pode ser usada por diferentes fluxos no app
 */
export default function PagamentoScreen() {
  const router = useRouter();
  const { state, resetCampaign } = useCampanha();

  // Obtém o valor total com base na campanha
  const amount = state.budget || 0;

  // Função para lidar com o pagamento concluído
  const handlePaymentComplete = (paymentMethod: PaymentMethod) => {
    // Aqui enviaria os dados da campanha para a API
    console.log("Campanha criada com pagamento via:", paymentMethod);

    // Exibe mensagem de sucesso
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

  // Função para navegar para a tela de resumo de pagamento quando PIX for selecionado
  const handlePixSelected = () => {
    router.push("/(campanhas)/resumo-pagamento");
  };

  // Informações da campanha para o título da tela de pagamento
  const getPlatformTitle = () => {
    switch (state.platform) {
      case "spotify":
        return "Spotify";
      case "youtube":
        return "YouTube";
      case "tiktok":
        return "TikTok";
      case "instagram":
        return "Instagram";
      default:
        return "música";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <PaymentScreen
          amount={amount}
          title={`Campanha ${getPlatformTitle()}`}
          description="Complete o pagamento para iniciar sua campanha"
          onPaymentComplete={handlePaymentComplete}
          onPixSelected={handlePixSelected}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
});
