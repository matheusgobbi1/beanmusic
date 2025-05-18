import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Button from "../common/Button";
import Input from "../common/Input";
import colors from "../../constants/colors";
import api from "../../services/api";

// Tipos de métodos de pagamento
export type PaymentMethod = "credit_card" | "pix" | "boleto" | null;

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  description: string;
}

// Interface para dados do cupom
interface CouponData {
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  isValid: boolean;
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
  onPaymentComplete: (paymentMethod: Exclude<PaymentMethod, null>, discountedAmount?: number, couponCode?: string) => void;
  onPixSelected?: (discountedAmount?: number, couponCode?: string) => void;
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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Calcula o valor final após aplicar o desconto do cupom
  const calculateFinalAmount = () => {
    if (!couponData?.isValid) {
      return amount;
    }

    if (couponData.type === 'fixed') {
      // Desconto de valor fixo
      return Math.max(0, amount - couponData.value);
    } else {
      // Desconto percentual
      return amount - (amount * (couponData.value / 100));
    }
  };

  const finalAmount = calculateFinalAmount();

  // Formata a exibição do desconto baseado no tipo
  const getDiscountText = () => {
    if (!couponData?.isValid) return "";
    
    if (couponData.type === 'fixed') {
      return `R$ ${couponData.value.toFixed(2)}`;
    } else {
      return `${couponData.value}%`;
    }
  };

  // Manipula o processo de pagamento
  const handlePayment = () => {
    if (selectedMethod) {
      onPaymentComplete(
        selectedMethod, 
        couponData?.isValid ? finalAmount : undefined,
        couponData?.isValid ? couponCode : undefined
      );
    }
  };

  // Verifica o cupom na API
  const verifyCoupon = async () => {
    // Se o código do cupom estiver vazio, limpa os dados e sai da função
    if (!couponCode.trim()) {
      setCouponError("Digite um código de cupom");
      return;
    }

    try {
      setVerifyingCoupon(true);
      setCouponError("");

      // Usando "Campanhas" como o serviço
      const response = await api.get(`/coupon/verify?service=Campanhas&q=${encodeURIComponent(couponCode.trim())}`);
      
      console.log("Resposta da verificação:", response.data);
      
      if (response.data && response.data.authorize) {
        // Determina o tipo e valor do cupom
        const couponType = response.data.type || 'percent';
        const couponValue = response.data.value || 0;
        
        setCouponData({
          code: couponCode,
          type: couponType,
          value: couponValue,
          isValid: true
        });
        
        // Removido o Alert de cupom aplicado para melhorar a experiência do usuário
      } else {
        setCouponError("Cupom inválido ou expirado");
        setCouponData(null);
      }
    } catch (error) {
      console.error("Erro ao verificar cupom:", error);
      setCouponError("Erro ao verificar o cupom. Tente novamente.");
      setCouponData(null);
    } finally {
      setVerifyingCoupon(false);
    }
  };

  // Manipula o clique em uma opção de pagamento
  const handlePaymentOptionClick = (method: PaymentMethod) => {
    setSelectedMethod(method);

    // Se for PIX, navega diretamente para a tela de resumo
    if (method === "pix" && onPixSelected) {
      // Passa informações do cupom para o componente pai
      if (couponData?.isValid) {
        onPixSelected(finalAmount, couponCode);
      } else {
        onPixSelected();
      }
    }
  };

  // Limpa o cupom aplicado
  const clearCoupon = () => {
    setCouponCode("");
    setCouponData(null);
    setCouponError("");
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
          {couponData?.isValid ? (
            <>
              <Text style={styles.amountOriginal}>
                R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.amountValue}>
                R$ {finalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  {getDiscountText()} OFF
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.amountValue}>
              R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
          )}
        </View>

        {/* Campo de cupom */}
        <View style={styles.couponSection}>
          <Text style={styles.couponTitle}>Tem um cupom de desconto?</Text>
          <View style={styles.couponInputContainer}>
            <Input
              value={couponCode}
              onChangeText={(text) => {
                setCouponCode(text);
                if (couponError) setCouponError("");
              }}
              placeholder="Digite o código do cupom"
              error={couponError}
              rightIcon={couponData?.isValid ? "checkmark-circle" : "pricetag-outline"}
              onRightIconPress={couponData?.isValid ? clearCoupon : verifyCoupon}
              disabled={verifyingCoupon || couponData?.isValid}
              style={styles.couponInput}
            />
            {verifyingCoupon && (
              <ActivityIndicator 
                size="small" 
                color={colors.primary.main} 
                style={styles.couponLoader} 
              />
            )}
          </View>
          {!couponData?.isValid && !couponError && !verifyingCoupon && (
            <TouchableOpacity onPress={verifyCoupon} style={styles.applyCouponButton}>
              <Text style={styles.applyCouponText}>Aplicar Cupom</Text>
            </TouchableOpacity>
          )}
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
    position: "relative",
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
  amountOriginal: {
    fontSize: 16,
    color: colors.text.disabled,
    textDecorationLine: "line-through",
    marginBottom: 4,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.status.success.main,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: colors.text.onDark,
    fontWeight: "bold",
    fontSize: 12,
  },
  couponSection: {
    marginBottom: 24,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 12,
  },
  couponInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  couponInput: {
    flex: 1,
  },
  couponLoader: {
    position: "absolute",
    right: 40,
  },
  applyCouponButton: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  applyCouponText: {
    color: colors.primary.main,
    fontWeight: "bold",
    fontSize: 14,
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
});

export default PaymentScreen;
