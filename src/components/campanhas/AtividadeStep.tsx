import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";

interface Atividade {
  id: string;
  titulo: string;
  data: string;
  status: "completed" | "current" | "pending";
  descricao?: string;
}

interface AtividadeStepProps {
  atividade: Atividade;
  isLast: boolean;
}

// Função para garantir que valores sejam strings
const sanitizeText = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return JSON.stringify(value);
};

// Componente para exibir um passo da atividade
const AtividadeStep = ({ atividade, isLast }: AtividadeStepProps) => {
  const getStatusColor = () => {
    switch (atividade.status) {
      case "completed":
        return colors.status.success.main;
      case "current":
        return colors.primary.main;
      default:
        return colors.text.disabled;
    }
  };

  const getStatusIcon = () => {
    switch (atividade.status) {
      case "completed":
        return "checkmark-circle";
      case "current":
        return "radio-button-on";
      default:
        return "ellipse-outline";
    }
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepIconContainer}>
        <Ionicons name={getStatusIcon()} size={24} color={getStatusColor()} />
        {!isLast && (
          <View
            style={[
              styles.stepLine,
              {
                backgroundColor:
                  atividade.status === "completed"
                    ? colors.status.success.main
                    : colors.text.disabled,
              },
            ]}
          />
        )}
      </View>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>{sanitizeText(atividade.titulo)}</Text>
          <Text style={styles.stepDate}>{sanitizeText(atividade.data)}</Text>
        </View>
        {atividade.descricao && (
          <Text style={styles.stepDescription}>
            {sanitizeText(atividade.descricao)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default AtividadeStep;
export type { Atividade };
