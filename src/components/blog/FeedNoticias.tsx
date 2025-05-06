import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { blogAPI } from "../../services/api";
import colors from "../../constants/colors";
import { router } from "expo-router"; // Para navegação ao clicar
import NoticiaSkeleton from "./NoticiaSkeleton"; // Importa o Skeleton

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
      // Alternativamente, poderia navegar usando item.show se for uma URL web externa
      // import { Linking } from 'react-native';
      // Linking.openURL(item.show);
    }
  };

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={handlePress}>
      {item.image ? (
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.itemImagem}
          resizeMode="cover"
        >
          <MaskedView
            style={styles.maskedViewArea}
            maskElement={
              <LinearGradient
                colors={["transparent", "black", "black"]}
                locations={[0, 0.4, 1]}
                style={{ flex: 1 }}
              />
            }
          >
            <BlurView style={styles.blurContent} tint="dark" intensity={80}>
              <View style={styles.textContentWrapper}>
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
            </BlurView>
          </MaskedView>
        </ImageBackground>
      ) : (
        <View style={[styles.itemImagem, styles.itemSemImagemFallback]}>
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
  const [noticias, setNoticias] = useState<NoticiaResumo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarFeed() {
      try {
        setIsLoading(true);
        setError(null);
        // A API retorna um objeto { data: [...] }
        const respostaApi = await blogAPI.getTodasNoticias();

        if (respostaApi && Array.isArray(respostaApi.data)) {
          setNoticias(respostaApi.data as NoticiaResumo[]);
        } else {
          console.warn(
            "[FeedNoticias] Formato de dados inesperado da API ou 'data' não é um array:",
            respostaApi
          );
          setNoticias([]);
        }
      } catch (err) {
        console.error(
          "[FeedNoticias] Erro ao carregar o feed de notícias:",
          err
        );
        setError("Falha ao carregar o feed. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    }

    carregarFeed();
  }, []);

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
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (noticias.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.statusText}>Nenhuma notícia encontrada.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={noticias}
      renderItem={renderNoticiaItem}
      keyExtractor={(item) => item.slug}
      contentContainerStyle={styles.listContainer}
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
  itemImagem: {
    width: "100%",
    height: 280,
    backgroundColor: colors.neutral.light,
  },
  itemSemImagemFallback: {
    backgroundColor: colors.neutral.dark,
    justifyContent: "flex-end",
    padding: 12,
  },
  maskedViewArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
  },
  blurContent: {
    flex: 1,
  },
  textContentWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 30,
  },
  itemConteudo: {
    flex: 1,
  },
  itemConteudoTexto: {
    // Padding agora é tratado por textContentWrapper
  },
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
});

export default FeedNoticias;
