import React, { useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ProtectedRoute } from "../../src/components/ProtectedRoute";
import { useAuth } from "../../src/contexts/AuthContext";
import Header from "../../src/components/common/Header";
import colors from "../../src/constants/colors";
import StatsCard from "../../src/components/home/StatsCard";
import { Ionicons } from "@expo/vector-icons";
import CampanhaCard, {
  CampanhaStatus,
} from "../../src/components/campanhas/CampanhaCard";
import { campanhasAPI } from "../../src/services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PromoSection from "../../src/components/home/PromoSection";

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

// Interface para promoções
interface Promotion {
  id: string;
  title: string;
  description: string;
  bgColor: readonly [string, string];
  icon: React.ComponentProps<typeof Ionicons>["name"];
  imageUrl?: string;
  onPress?: () => void;
}

export default function Home() {
  const { state } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Referência para controlar se os dados já foram carregados pelo menos uma vez
  const dadosCarregados = useRef(false);

  // Estados para campanhas
  const [campanhas, setCampanhas] = React.useState<Campanha[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Estados para estatísticas
  const [userStats, setUserStats] = React.useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalListeners: 0,
  });

  // Promoções estáticas (sem API)
  const promotions: Promotion[] = [
    {
      id: "1",
      title: "Premium 20% OFF",
      description: "20% de desconto em campanhas premium por tempo limitado",
      bgColor: ["#8E2DE2", "#4A00E0"] as readonly [string, string],
      icon: "star",
    },
    {
      id: "2",
      title: "Playlists Virais",
      description: "Acesso exclusivo às playlists virais com mais ouvintes",
      bgColor: ["#FF416C", "#FF4B2B"] as readonly [string, string],
      icon: "trending-up",
    },
  ];

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

  const fetchCampanhas = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (!dadosCarregados.current) {
        // Só mostrar o indicador de carregamento na primeira vez
        setLoading(true);
      }

      const response = await campanhasAPI.getUserCampaigns();
      const processedData = processarDadosCampanhas(response);

      setCampanhas(processedData);

      // Atualizar estatísticas com base nos dados reais
      const activeCount = processedData.filter(
        (c) => c.status === "active"
      ).length;

      setUserStats({
        totalCampaigns: processedData.length,
        activeCampaigns: activeCount,
        totalListeners: Math.floor(Math.random() * 5000), // Exemplo randômico, substituir por dados reais
      });

      // Marcar que os dados já foram carregados pelo menos uma vez
      dadosCarregados.current = true;
    } catch (error) {
      console.error("Erro ao buscar campanhas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchCampanhas(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCampanhas();
    }, [])
  );

  // Navegação para a tela de campanhas
  const handleViewAllCampaigns = () => {
    router.push("/(tabs)/campanhas");
  };

  // Navegação para criar nova campanha
  const handleCriarCampanha = () => {
    router.push("/campanhas/criar");
  };

  // Renderizar campanhas recentes (horizontalmente)
  const renderCampanhasRecentes = () => {
    if (loading && !refreshing && !dadosCarregados.current) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary.main} size="small" />
        </View>
      );
    }

    if (campanhas.length === 0) {
      return (
        <View style={styles.emptyCampanhasContainer}>
          <Ionicons
            name="musical-notes-outline"
            size={40}
            color={colors.text.secondary}
          />
          <Text style={styles.emptyText}>Nenhuma campanha encontrada</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCriarCampanha}
          >
            <Text style={styles.createButtonText}>Criar Campanha</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.recentCampanhasContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Campanhas recentes</Text>
          <TouchableOpacity onPress={handleViewAllCampaigns}>
            <Text style={styles.viewAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={campanhas.slice(0, 5)} // Mostrar apenas as 5 mais recentes
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContainer}
          renderItem={({ item }) => (
            <View style={styles.campanhaCardContainer}>
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
        />
      </View>
    );
  };

  // Calcular o espaço necessário para a TabBar flutuante
  const tabBarHeight = 65; // Altura da TabBar
  const tabBarBottomMargin = insets.bottom > 0 ? insets.bottom + 10 : 30;
  const bottomSpacing = tabBarHeight + tabBarBottomMargin;

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Header
          title="Bean Music"
          showLogo={true}
          rightIcon="notifications-outline"
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomSpacing },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary.main]}
            />
          }
        >
          {/* Estatísticas */}
          <View style={styles.section}>
            <StatsCard
              totalCampaigns={userStats.totalCampaigns}
              activeCampaigns={userStats.activeCampaigns}
              totalListeners={userStats.totalListeners}
            />
          </View>

          {/* Campanhas Recentes */}
          {renderCampanhasRecentes()}

          {/* Promoções */}
          <PromoSection promotions={promotions} />
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    flexGrow: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  recentCampanhasContainer: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: "500",
  },
  horizontalListContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  campanhaCardContainer: {
    width: 180,
    marginHorizontal: 4,
  },
  emptyCampanhasContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
    marginBottom: 16,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
