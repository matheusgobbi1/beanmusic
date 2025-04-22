import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Button from "../common/Button";
import colors from "../../constants/colors";

// Tipos de métodos de pagamento
export type PaymentMethod = "credit_card" | "pix" | "boleto" | null;

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  description: string;
}

// Opções de pagamento disponíveis
const paymentOptions: PaymentOption[] = [
  {
    id: "credit_card",
    label: "Cartão de Crédito",
    icon: "card-outline",
    description: "Pagamento imediato com parcelamento em até 12x",
  },
  {
    id: "pix",
    label: "PIX",
    icon: "qr-code-outline",
    description: "Transferência instantânea com QR Code",
  },
  {
    id: "boleto",
    label: "Boleto Bancário",
    icon: "document-text-outline",
    description: "Vencimento em 3 dias úteis",
  },
];

interface PaymentScreenProps {
  amount: number;
  title: string;
  description: string;
  onPaymentComplete: (paymentMethod: Exclude<PaymentMethod, null>) => void;
  onPixSelected?: () => void;
}

/**
 * Componente reutilizável para tela de pagamento
 */
const PaymentScreen: React.FC<PaymentScreenProps> = ({
  amount,
  title,
  description,
  onPaymentComplete,
  onPixSelected,
}) => {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] =
    React.useState<PaymentMethod>(null);

  // Manipula o processo de pagamento
  const handlePayment = () => {
    if (selectedMethod) {
      onPaymentComplete(selectedMethod);
    }
  };

  // Manipula o clique em uma opção de pagamento
  const handlePaymentOptionClick = (method: PaymentMethod) => {
    setSelectedMethod(method);

    // Se for PIX e tiver um callback, navega para tela de resumo
    if (method === "pix" && onPixSelected) {
      onPixSelected();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {/* Valor do pagamento */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Valor Total</Text>
          <Text style={styles.amountValue}>
            R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Opções de pagamento */}
        <View style={styles.paymentOptions}>
          <Text style={styles.paymentOptionsTitle}>Escolha como pagar</Text>
          {paymentOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.paymentOption,
                selectedMethod === option.id && styles.paymentOptionSelected,
              ]}
              onPress={() => handlePaymentOptionClick(option.id)}
            >
              <View style={styles.paymentOptionIcon}>
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={colors.primary.main}
                />
              </View>
              <View style={styles.paymentOptionInfo}>
                <Text style={styles.paymentOptionLabel}>{option.label}</Text>
                <Text style={styles.paymentOptionDescription}>
                  {option.description}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Informações de segurança */}
        <View style={styles.securityInfo}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={colors.text.disabled}
          />
          <Text style={styles.securityText}>
            Pagamento 100% seguro. Seus dados são criptografados e protegidos.
          </Text>
        </View>
      </ScrollView>

      {/* Footer com botão de pagamento */}
      <View style={styles.footer}>
        <Button
          title="Pagar Agora"
          onPress={handlePayment}
          disabled={!selectedMethod}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  amountContainer: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary.main,
  },
  paymentOptions: {
    marginBottom: 24,
  },
  paymentOptionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  paymentOptionSelected: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.light + "10",
  },
  paymentOptionIcon: {
    marginRight: 16,
  },
  paymentOptionInfo: {
    flex: 1,
  },
  paymentOptionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  paymentOptionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  securityText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.text.disabled,
  },
  footer: {
    padding: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default PaymentScreen;
