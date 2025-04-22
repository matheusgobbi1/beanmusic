import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useCampanha } from "../../contexts/CampanhaContext";
import colors from "../../constants/colors";

// Opções predefinidas de orçamento
const budgetOptions = [
  { value: 100, label: "R$ 100" },
  { value: 200, label: "R$ 200" },
  { value: 300, label: "R$ 300" },
  { value: 500, label: "R$ 500" },
  { value: 1000, label: "R$ 1.000" },
];

// Valor mínimo e máximo do orçamento
const MIN_BUDGET = 50;
const MAX_BUDGET = 2000;

/**
 * Componente para seleção do orçamento da campanha
 * Memoizado para evitar renderizações desnecessárias
 */
const OrcamentoCampanha = React.memo(() => {
  const { state, setBudget } = useCampanha();
  const budget = useMemo(() => state.budget, [state.budget]);

  // Define valor inicial se ainda não foi definido
  React.useEffect(() => {
    if (!budget) {
      setBudget(budgetOptions[0].value);
    }
  }, []);

  // Função para atualizar o orçamento
  const handleBudgetChange = useCallback(
    (value: number) => {
      setBudget(Math.round(value));
    },
    [setBudget]
  );

  // Função para selecionar opção predefinida
  const handleSelectOption = useCallback(
    (value: number) => {
      setBudget(value);
    },
    [setBudget]
  );

  // Renderiza as opções de orçamento
  const renderBudgetOptions = useMemo(() => {
    return budgetOptions.map((option) => (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.optionButton,
          budget === option.value && styles.optionButtonSelected,
        ]}
        onPress={() => handleSelectOption(option.value)}
      >
        <Text
          style={[
            styles.optionText,
            budget === option.value && styles.optionTextSelected,
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    ));
  }, [budget, handleSelectOption]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Defina seu Orçamento</Text>
      <Text style={styles.subtitle}>
        Escolha quanto deseja investir na sua campanha
      </Text>

      {/* Valor do orçamento */}
      <View style={styles.budgetValueContainer}>
        <Text style={styles.budgetValue}>
          R$ {budget?.toLocaleString("pt-BR") || "0"}
        </Text>
        <Text style={styles.budgetCaption}>Investimento total</Text>
      </View>

      {/* Slider de orçamento */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={MIN_BUDGET}
          maximumValue={MAX_BUDGET}
          step={10}
          value={budget || MIN_BUDGET}
          onValueChange={handleBudgetChange}
          minimumTrackTintColor={colors.primary.main}
          maximumTrackTintColor={colors.border.main}
          thumbTintColor={colors.primary.main}
        />
        <View style={styles.sliderLabelsContainer}>
          <Text style={styles.sliderLabel}>R$ {MIN_BUDGET}</Text>
          <Text style={styles.sliderLabel}>R$ {MAX_BUDGET}</Text>
        </View>
      </View>

      {/* Opções de orçamento predefinidas */}
      <View>
        <Text style={styles.optionsTitle}>Valores Sugeridos</Text>
        <View style={styles.optionsContainer}>{renderBudgetOptions}</View>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 32,
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
  budgetValueContainer: {
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  budgetValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.primary.main,
    marginBottom: 4,
  },
  budgetCaption: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  sliderContainer: {
    marginBottom: 32,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.text.disabled,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 32,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.background.inputField,
    margin: 4,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  optionText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  optionTextSelected: {
    color: colors.text.onDark,
    fontWeight: "bold",
  },
});

export default OrcamentoCampanha;
