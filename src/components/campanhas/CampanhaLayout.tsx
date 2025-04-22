import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCampanha } from "../../contexts/CampanhaContext";
import Button from "../common/Button";
import colors from "../../constants/colors";

const { width } = Dimensions.get("window");

interface CampanhaLayoutProps {
  children: React.ReactNode;
  hideNextButton?: boolean;
  nextButtonLabel?: string;
  onNextPress?: () => void;
  nextDisabled?: boolean;
}

/**
 * Layout padrão para o fluxo de campanhas com header de steps e footer com botão
 */
const CampanhaLayout: React.FC<CampanhaLayoutProps> = ({
  children,
  hideNextButton = false,
  nextButtonLabel = "Continuar",
  onNextPress,
  nextDisabled = false,
}) => {
  const router = useRouter();
  const { state, prevStep, nextStep } = useCampanha();
  const { currentStep, totalSteps } = state;

  // Função para lidar com o botão de voltar
  const handleBack = () => {
    if (currentStep > 1) {
      prevStep();
    } else {
      // Se estiver na primeira etapa, volta para a tela anterior
      router.back();
    }
  };

  // Função para lidar com o botão de continuar
  const handleNext = () => {
    if (onNextPress) {
      onNextPress();
    } else {
      nextStep();
    }
  };

  // Renderiza os indicadores de etapa
  const renderStepIndicators = () => {
    const indicators = [];

    for (let i = 1; i <= totalSteps; i++) {
      indicators.push(
        <View
          key={i}
          style={[
            styles.stepIndicator,
            i <= currentStep ? styles.activeStep : styles.inactiveStep,
          ]}
        />
      );
    }

    return indicators;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.stepsContainer}>{renderStepIndicators()}</View>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>{children}</View>

      {/* Footer */}
      {!hideNextButton && (
        <View style={styles.footer}>
          <Button
            title={nextButtonLabel}
            onPress={handleNext}
            disabled={nextDisabled}
            variant="primary"
            size="large"
            fullWidth
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: 8,
  },
  stepsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 40, // Compensa o botão de voltar
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeStep: {
    backgroundColor: colors.primary.main,
  },
  inactiveStep: {
    backgroundColor: colors.text.disabled,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    paddingBottom: 8,
    borderTopColor: colors.border.light,
  },
});

export default CampanhaLayout;
