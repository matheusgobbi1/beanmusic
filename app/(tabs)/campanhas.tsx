import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Header from "../../src/components/common/Header";
import colors from "../../src/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import CampanhaCard, {
  CampanhaStatus,
} from "../../src/components/campanhas/CampanhaCard";
import { campanhasAPI } from "../../src/services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Interface para o objeto de campanha
interface Campanha {
  id: string;
  title: string;
  platform: string;
  status: CampanhaStatus;
  date: string;
  imageUrl?: string;
  track_name_format?: string;
  artist_name?: string;
  image?: string;
}

export default function Campanhas() {
  const [campanhas, setCampanhas] = React.useState<Campanha[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [nextPageUrl, setNextPageUrl] = React.useState<string | null>(null);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const processarDadosCampanhas = (data: any): Campanha[] => {
    if (!data || !data.data) {
      console.warn("Formato de resposta da API inesperado:", data);
      return [];
    }

    return data.data.map((item: any) => ({
      id: item.id || `temp-${Math.random()}`,
      title: item.track_name_format || "Sem título",
      platform: item.platform || "spotify",
      status: mapearStatus(item.status),
      date: item.created_at || new Date().toLocaleDateString(),
      imageUrl: item.image,
      // Preservar campos originais para compatibilidade
      track_name_format: item.track_name_format,
      artist_name: item.artist_name,
      image: item.image,
    }));
  };

  // Mapeamento de status do backend para o formato do componente
  const mapearStatus = (status: string): CampanhaStatus => {
    switch (status) {
      case "active":
        return "active";
      case "pending":
      case "analise":
        return "pending";
      case "completed":
        return "completed";
      case "rejected":
      case "inactive":
        return "rejected";
      default:
        return "pending";
    }
  };

  const fetchCampanhas = async (url = "/me/campaigns", isRefresh = false) => {
    if (loading && !isRefresh) return;

    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      const response = await campanhasAPI.getUserCampaigns();
      const processedData = processarDadosCampanhas(response);

      if (isRefresh || !url.includes("page=")) {
        setCampanhas(processedData);
      } else {
        // Acumular dados para paginação
        setCampanhas((prev) => [
          ...prev,
          ...processedData.filter(
            (newItem) => !prev.some((item) => item.id === newItem.id)
          ),
        ]);
      }

      // Verificar se há próxima página
      setNextPageUrl(response.links?.next || null);
    } catch (error) {
      console.error("Erro ao buscar campanhas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!nextPageUrl || loadingMore) return;
    setLoadingMore(true);
    fetchCampanhas(nextPageUrl);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCampanhas("/me/campaigns", true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCampanhas("/me/campaigns", true);
    }, [])
  );

  const handleCriarCampanha = () => {
    router.push("/campanhas/criar");
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyStateContent}>
      <Ionicons
        name="musical-notes-outline"
        size={80}
        color={colors.primary.main}
      />
      <Text style={styles.emptyText}>
        Nenhuma campanha disponível no momento
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCriarCampanha}
      >
        <Text style={styles.createButtonText}>Criar Campanha</Text>
      </TouchableOpacity>
    </View>
  );

  // Definir número de colunas para o grid
  const numColumns = 2;
  // Calcular a largura de cada item considerando os espaçamentos
  const screenWidth = Dimensions.get("window").width;
  const padding = 16; // Padding da lista
  const gap = 8; // Espaço entre os cards
  const totalGapWidth = gap * (numColumns - 1);
  const availableWidth = screenWidth - padding * 2 - totalGapWidth;
  const itemWidth = availableWidth / numColumns;

  // Calcular o espaço necessário para a TabBar flutuante
  const tabBarHeight = 65; // Altura da TabBar
  const tabBarBottomMargin = insets.bottom > 0 ? insets.bottom + 10 : 30; // Mesma lógica do _layout.tsx
  const bottomSpacing = tabBarHeight + tabBarBottomMargin + 20; // Adicionar espaço extra

  return (
    <View style={styles.container}>
      <Header title="Campanhas" showLogo={true} rightIcon="search-outline" />

      <View style={styles.contentContainer}>
        <FlatList
          data={campanhas}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={{ width: itemWidth }}>
              <CampanhaCard
                id={item.id}
                title={item.title}
                platform={item.platform}
                status={item.status}
                date={item.date}
                imageUrl={item.imageUrl || item.image}
                artist={item.artist_name}
              />
            </View>
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomSpacing },
          ]}
          ListEmptyComponent={!loading ? renderEmptyComponent : null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loadingMore && nextPageUrl ? (
              <ActivityIndicator
                size="small"
                color={colors.primary.main}
                style={styles.loadingIndicator}
              />
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 8,
  },
  emptyStateContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  createButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
});
