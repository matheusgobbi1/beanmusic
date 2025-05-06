import React from "react";
import { View, StyleSheet /*, Dimensions*/ } from "react-native"; // Dimensions não é mais necessário aqui
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../constants/colors";

// const { width } = Dimensions.get("window"); // Removido
// const CARD_MARGIN_HORIZONTAL = 12; // Removido
// const CARD_WIDTH = width - CARD_MARGIN_HORIZONTAL * 2; // Removido
const IMAGE_HEIGHT = 280; // Mesma altura da imagem original

// Componente Shimmer reutilizável
function ShimmerPlaceholder({ style }: { style?: any }) {
  return (
    <LinearGradient
      colors={[
        colors.neutral.light,
        colors.neutral.medium,
        colors.neutral.light,
      ]}
      style={[styles.shimmerBase, style]} // Usar shimmerBase e permitir override
      start={{ x: -1, y: 0.5 }}
      end={{ x: 2, y: 0.5 }}
      locations={[0.3, 0.5, 0.7]} // Ajuste para um shimmer mais rápido/curto
    />
  );
}

export default function NoticiaSkeleton(): React.JSX.Element {
  return (
    <View style={styles.itemContainer}>
      {/* Placeholder para a Imagem */}
      <View style={styles.itemImagemSkeleton}>
        {/* Container para simular a área de texto sobre a imagem (como o BlurView) */}
        <View style={styles.textOverlayContainer}>
          <ShimmerPlaceholder style={styles.tituloSkeleton} />
          <ShimmerPlaceholder style={styles.resumoLine1Skeleton} />
          <ShimmerPlaceholder style={styles.resumoLine2Skeleton} />
          <ShimmerPlaceholder style={styles.dataSkeleton} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: colors.background.paper, // Cor de fundo do card
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    width: "100%", // Alterado para ocupar 100% do espaço fornecido pelo FlatList
  },
  itemImagemSkeleton: {
    width: "100%",
    height: IMAGE_HEIGHT,
    backgroundColor: colors.neutral.dark, // Cor de fundo mais escura para o shimmer da imagem se destacar
    justifyContent: "flex-end", // Alinha o textOverlayContainer na parte inferior
  },
  textOverlayContainer: {
    // Simula o textContentWrapper do FeedNoticias
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 30, // Espaço acima do título, como no original
    // A altura é implícita pelo conteúdo, mas o shimmer da imagem preenche o resto
  },
  tituloSkeleton: {
    width: "70%",
    height: 20, // Altura baseada no fontSize do título original
    borderRadius: 4,
    marginBottom: 10, // Próximo ao marginBottom: 6 do original
  },
  resumoLine1Skeleton: {
    width: "90%",
    height: 15, // Altura baseada no fontSize do resumo original
    borderRadius: 4,
    marginBottom: 6, // Espaço entre linhas do resumo
  },
  resumoLine2Skeleton: {
    width: "80%", // Linha 2 geralmente é um pouco menor
    height: 15,
    borderRadius: 4,
    marginBottom: 10, // Próximo ao marginBottom: 8 do resumo original antes da data
  },
  dataSkeleton: {
    width: "40%",
    height: 12, // Altura baseada no fontSize da data original
    borderRadius: 4,
    // marginTop: 8, // Removido, o espaçamento vem do marginBottom do resumo
  },
  shimmerBase: {
    backgroundColor: colors.neutral.light, // Cor base para o gradiente
    overflow: "hidden",
  },
});
