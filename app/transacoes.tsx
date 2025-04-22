import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "../src/constants/colors";
import { useQuery } from "@tanstack/react-query";
import api from "../src/services/api";

// Interface para as transações
interface Transacao {
  id: string;
  data: string;
  descricao: string;
  price?: string;
  method?: string;
  status: string;
}

export default function TransacoesScreen() {
  const router = useRouter();

  // Busca as transações da API usando React Query
  const { data, isLoading, error } = useQuery<Transacao[], Error>({
    queryKey: ["transacoes"],
    queryFn: async () => {
      try {
        const response = await api.get("/me/invoices");
        return response.data.data as Transacao[];
      } catch (error: any) {
        console.error(
          "Erro ao buscar pagamentos:",
          error.response?.data || error.message
        );
        throw new Error(error.message || "Falha ao buscar transações");
      }
    },
  });

  // Funções auxiliares para determinar status, cores e ícones
  const getStatusText = (status: string) => {
    switch (status) {
      case "Pagamento Criado":
        return "Pendente";
      case "Pagamento Aprovado":
        return "Aprovado";
      case "Pagamento Processando":
        return "Em Processamento";
      case "Pagamento Falhou":
        return "Falhou";
      case "Pagamento Estornado":
        return "Estornado";
      case "Pagamento Cancelado":
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pagamento Criado":
        return colors.status.warning.main;
      case "Pagamento Aprovado":
        return colors.status.success.main;
      case "Pagamento Processando":
        return colors.status.info.main;
      case "Pagamento Estornado":
        return colors.status.success.main;
      case "Pagamento Falhou":
      case "Pagamento Cancelado":
        return colors.status.error.main;
      default:
        return colors.text.disabled;
    }
  };

  // Função para adicionar opacidade a uma cor hexadecimal
  const addOpacityToColor = (color: string) => {
    return `${color}20`; // 20 = 12.5% de opacidade
  };

  const getPaymentIcon = (method: string = "") => {
    if (method.includes("PayPal")) return "logo-paypal";
    if (method.includes("Pix")) return "qr-code";
    if (method.includes("Boleto")) return "barcode-outline";
    if (method.includes("Cartão")) return "card";
    return "cash-outline";
  };

  const renderItem = ({ item }: { item: Transacao }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.transactionItem}>
        {/* Cabeçalho: Data e Status */}
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionDate}>{item.data}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: addOpacityToColor(statusColor) },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        {/* Descrição da transação */}
        <Text style={styles.transactionDescription}>{item.descricao}</Text>

        {/* Corpo: Método de Pagamento e Valor */}
        <View style={styles.transactionBody}>
          {item.method && (
            <View style={styles.paymentMethodContainer}>
              <Ionicons
                name={getPaymentIcon(item.method)}
                size={18}
                color={colors.primary.main}
                style={styles.paymentIcon}
              />
              <Text style={styles.transactionMethod}>{item.method}</Text>
            </View>
          )}

          <Text style={styles.transactionAmount}>{item.price || "N/A"}</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>Histórico de Transações</Text>

          <View style={styles.rightButtonPlaceholder} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.loadingText}>Carregando transações...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={colors.status.error.main}
            />
            <Text style={styles.errorText}>Erro ao carregar transações</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.replace("/transacoes")}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : data && data.length > 0 ? (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.transactionsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="receipt-outline"
              size={48}
              color={colors.text.disabled}
            />
            <Text style={styles.emptyStateText}>
              Sem transações para exibir
            </Text>
          </View>
        )}
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  rightButtonPlaceholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  transactionsList: {
    padding: 16,
  },
  transactionItem: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  transactionDate: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 12,
  },
  transactionBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentMethodContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIcon: {
    marginRight: 6,
  },
  transactionMethod: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  transactionAmount: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 12,
  },
});
