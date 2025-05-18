import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { blogAPI } from "../../services/api";
import colors from "../../constants/colors";
import { router } from "expo-router";
import NoticiaSkeleton from "./NoticiaSkeleton";
import { useQuery } from "@tanstack/react-query";

// Interface ajustada para corresponder à API de beanmusicpromotion.com/api/v1/blog
interface NoticiaResumo {
  slug: string; // Usado como ID e para navegação
  title_limit: string; // Mapeia para o nosso 'titulo'
  subtitle: string; // Mapeia para o nosso 'resumo'
  posted_at: string; // Mapeia para o nosso 'dataPublicacao'
  show: string; // URL para a notícia completa (pode ser útil para navegação)
  image: string; // Mapeia para o nosso 'imagemUrl'
  // body_output é null, então não incluímos a menos que necessário
}

const ITENS_POR_PAGINA = 5;
const imagePlaceholder = colors.neutral.medium; // Placeholder para expo-image
const IMAGE_HEIGHT = 280;
const MASKED_VIEW_HEIGHT = IMAGE_HEIGHT * 0.6; // 60% da altura da imagem para a área de efeito

const renderNoticiaItem = ({ item }: { item: NoticiaResumo }) => {
  const handlePress = () => {
    // Navegação para a notícia usando o slug, abrindo como modal.
    if (item.slug) {
      router.push(`/blog/modal/${item.slug}`);
    } else {
      console.warn(
        "[FeedNoticias] Slug não encontrado para o item:",
        item.title_limit
      );
    }
  };

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={handlePress}>
      {item.image ? (
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.image }}
            style={styles.itemImagemExpo}
            placeholder={imagePlaceholder}
            transition={300}
            contentFit="cover"
          />
          <View style={styles.overlayEffectHolderContainer}>
            <View style={styles.effectHolder}>
              <MaskedView
                style={StyleSheet.absoluteFill} // MaskedView preenche o effectHolder
                maskElement={
                  <LinearGradient
                    colors={["transparent", "black", "black"]} // Fade de transparente para opaco
                    locations={[0, 0.35, 1]} // Efeito nos 30% inferiores do effectHolder
                    style={{ flex: 1 }}
                  />
                }
              >
                <BlurView
                  style={StyleSheet.absoluteFill} // Camada de Blur (embaixo)
                  intensity={20}
                />
                <View
                  style={styles.fadedDarkBackground} // Camada de Fundo Escuro (meio)
                />
                <View style={styles.textContentWrapperOverEffects}>
                  {/* Camada de Texto (em cima) */}
                  <Text style={styles.itemTitulo}>{item.title_limit}</Text>
                  <Text
                    style={styles.itemResumo}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.subtitle}
                  </Text>
                  {item.posted_at && (
                    <Text style={styles.itemData}>{item.posted_at}</Text>
                  )}
                </View>
              </MaskedView>
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.imageAreaBase, styles.itemSemImagemFallback]}>
          <View style={styles.itemConteudoTexto}>
            <Text style={styles.itemTitulo}>{item.title_limit}</Text>
            <Text
              style={styles.itemResumo}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.subtitle}
            </Text>
            {item.posted_at && (
              <Text style={styles.itemData}>{item.posted_at}</Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

function FeedNoticias(): React.JSX.Element {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [noticiasMostradas, setNoticiasMostradas] = useState<NoticiaResumo[]>([]);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [todasCarregadas, setTodasCarregadas] = useState(false);

  // Usando React Query para gerenciar o estado e as requisições
  const { 
    data: todasNoticias, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['blogFeed'],
    queryFn: async () => {
      const respostaApi = await blogAPI.getTodasNoticias();
      
      if (respostaApi && Array.isArray(respostaApi.data)) {
        return respostaApi.data as NoticiaResumo[];
      }
      
      console.warn(
        "[FeedNoticias] Formato de dados inesperado da API ou 'data' não é um array:",
        respostaApi
      );
      return [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutos de cache
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  // Efeito para carregar as primeiras notícias quando os dados estiverem disponíveis
  React.useEffect(() => {
    if (todasNoticias && todasNoticias.length > 0 && noticiasMostradas.length === 0) {
      const primeirasNoticias = todasNoticias.slice(0, ITENS_POR_PAGINA);
      setNoticiasMostradas(primeirasNoticias);
      setTodasCarregadas(primeirasNoticias.length >= todasNoticias.length);
    }
  }, [todasNoticias]);

  const carregarMaisNoticias = () => {
    if (carregandoMais || todasCarregadas || !todasNoticias) return;

    setCarregandoMais(true);
    
    const proximaPagina = paginaAtual + 1;
    const inicio = (proximaPagina - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    
    // Simula uma pequena latência para mostrar o indicador de carregamento
    setTimeout(() => {
      const novasNoticias = todasNoticias.slice(inicio, fim);
      
      if (novasNoticias.length > 0) {
        setNoticiasMostradas([...noticiasMostradas, ...novasNoticias]);
        setPaginaAtual(proximaPagina);
      }
      
      setTodasCarregadas(fim >= todasNoticias.length);
      setCarregandoMais(false);
    }, 500);
  };

  const renderFooter = () => {
    if (!carregandoMais) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary.main} />
        <Text style={styles.carregandoText}>Carregando mais notícias...</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Renderiza múltiplos Skeletons para preencher a tela inicial */}
        <FlatList
          data={[1, 2, 3]} // Array para renderizar 3 skeletons
          renderItem={() => <NoticiaSkeleton />}
          keyExtractor={(item) => `skeleton-${item}`}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Falha ao carregar o feed. Tente novamente mais tarde.</Text>
      </View>
    );
  }

  if (!noticiasMostradas || noticiasMostradas.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.statusText}>Nenhuma notícia encontrada.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={noticiasMostradas}
      renderItem={renderNoticiaItem}
      keyExtractor={(item) => item.slug}
      contentContainerStyle={styles.listContainer}
      initialNumToRender={ITENS_POR_PAGINA}
      maxToRenderPerBatch={ITENS_POR_PAGINA}
      windowSize={5}
      onEndReached={carregarMaisNoticias}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
    />
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.status.error.main,
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: colors.background.default,
  },
  itemContainer: {
    backgroundColor: colors.background.paper,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  imageAreaBase: {
    width: "100%",
    height: IMAGE_HEIGHT,
    backgroundColor: colors.neutral.light,
  },
  imageWrapper: {
    width: "100%",
    height: IMAGE_HEIGHT,
  },
  itemImagemExpo: {
    width: "100%",
    height: "100%",
  },
  overlayEffectHolderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  effectHolder: {
    width: "100%",
    height: MASKED_VIEW_HEIGHT,
  },
  fadedDarkBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  textContentWrapperOverEffects: {
    // Renomeado para clareza, antigo textContentWrapper
    ...StyleSheet.absoluteFillObject, // Garante que o texto se alinhe com as camadas abaixo
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 30,
    // SEM backgroundColor aqui, para o fadedDarkBackground ser visível
  },
  itemConteudoTexto: {},
  itemTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.neutral.white,
    marginBottom: 6,
  },
  itemResumo: {
    fontSize: 15,
    color: colors.neutral.light,
    marginBottom: 8,
    lineHeight: 20,
  },
  itemData: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  itemSemImagemFallback: {
    backgroundColor: colors.neutral.dark,
    justifyContent: "flex-end",
    padding: 12,
  },
  footerLoader: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  carregandoText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.text.secondary,
  }
});

export default FeedNoticias;
