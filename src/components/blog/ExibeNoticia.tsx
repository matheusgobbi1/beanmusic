import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import RenderHTML, { defaultSystemFonts } from "react-native-render-html";
import { blogAPI } from "../../services/api";
import colors from "../../constants/colors";
import { useQuery } from "@tanstack/react-query";

// Interface ajustada para corresponder à API de beanmusicpromotion.com/api/v1/blog/slug
interface NoticiaDetalhada {
  title_limit: string;
  subtitle: string; // Pode ser útil exibir também
  slug: string;
  posted_at: string;
  show: string; // URL para a notícia completa (pode ser útil para um link "Ver original")
  image: string; // URL da imagem
  body_output: string; // Conteúdo HTML da notícia
}

interface ExibeNoticiaProps {
  slug: string;
}

const imagePlaceholder = colors.neutral.medium;

function ExibeNoticia({ slug }: ExibeNoticiaProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const systemFonts = [...defaultSystemFonts, 'Arial', 'Roboto', 'sans-serif'];
  
  // Usando React Query para gerenciar o estado e as requisições
  const { 
    data: noticia, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['noticia', slug],
    queryFn: async (): Promise<NoticiaDetalhada> => {
      if (!slug) {
        throw new Error("Slug da notícia não fornecido.");
      }
      
      const respostaApi = await blogAPI.getNoticiaBySlug(slug);
      
      if (respostaApi && respostaApi.data) {
        // Mapeia os campos da API para a nossa interface NoticiaDetalhada
        const result: NoticiaDetalhada = {
          title_limit: respostaApi.data.title_limit,
          subtitle: respostaApi.data.subtitle,
          slug: respostaApi.data.slug,
          posted_at: respostaApi.data.posted_at,
          show: respostaApi.data.show,
          image: respostaApi.data.image,
          body_output: respostaApi.data.body_output,
        };
        return result;
      }
      
      console.warn(
        `[ExibeNoticia] Formato de dados inesperado da API para o slug '${slug}':`,
        respostaApi
      );
      throw new Error("Formato de dados inválido recebido da API.");
    },
    enabled: !!slug,
    staleTime: 30 * 60 * 1000, // 30 minutos de cache
    gcTime: 60 * 60 * 1000, // 1 hora de retenção em cache
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.statusText}>Carregando notícia...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>
          Falha ao carregar a notícia. Tente novamente mais tarde.
        </Text>
      </View>
    );
  }

  if (!noticia) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.statusText}>
          Nenhuma notícia encontrada para o slug: {slug}
        </Text>
      </View>
    );
  }

  // Formata a data de forma mais amigável (exemplo simples)
  // Idealmente, usar uma lib como date-fns se precisar de formatação mais complexa ou i18n
  let dataFormatada = noticia.posted_at;
  // Se posted_at for uma string de data válida, pode tentar formatar:
  // try {
  //   dataFormatada = new Date(noticia.posted_at).toLocaleDateString('pt-BR', {
  //     year: 'numeric', month: 'long', day: 'numeric'
  //   });
  // } catch (e) { /* mantém o valor original se falhar */ }

  const renderersProps = {
    ul: {
      enableExperimentalRtl: true,
    },
    ol: {
      enableExperimentalRtl: true,
    },
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainerScroll}
    >
      {noticia.image && (
        <Image 
          source={{ uri: noticia.image }} 
          style={styles.imagem}
          placeholder={imagePlaceholder}
          transition={300}
          cachePolicy="memory-disk"
          contentFit="cover"
        />
      )}
      <View style={styles.textWrapper}>
        <Text style={styles.titulo}>{noticia.title_limit}</Text>
        {noticia.subtitle && (
          <Text style={styles.subtitulo}>{noticia.subtitle}</Text>
        )}
        <Text style={styles.data}>Publicado: {dataFormatada}</Text>
        {noticia.body_output ? (
          <RenderHTML
            contentWidth={width}
            source={{ html: noticia.body_output }}
            baseStyle={styles.htmlBaseStyle}
            tagsStyles={tagsStyles}
            systemFonts={systemFonts}
            renderersProps={renderersProps}
            enableExperimentalMarginCollapsing
          />
        ) : (
          <Text style={styles.conteudo}>Conteúdo não disponível.</Text>
        )}
      </View>
    </ScrollView>
  );
}

// Adicionado para estilizar o HTML
const tagsStyles = {
  p: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    color: colors.text.primary, // Exemplo, ajuste conforme seu colors.ts
  },
  h1: {
    fontSize: 28,
    fontWeight: "bold" as "bold",
    marginTop: 16,
    marginBottom: 8,
    color: colors.text.primary,
  },
  h2: {
    fontSize: 24,
    fontWeight: "bold" as "bold",
    marginTop: 12,
    marginBottom: 6,
    color: colors.text.primary,
  },
  h3: {
    fontSize: 20,
    fontWeight: "bold" as "bold",
    marginTop: 10,
    marginBottom: 4,
    color: colors.text.primary,
  },
  ul: {
    marginBottom: 12,
    marginLeft: 20, // Adiciona um recuo para listas
  },
  li: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.primary,
    marginBottom: 6,
  },
  a: {
    color: colors.primary.main, // Exemplo para links
    textDecorationLine: "underline" as "underline",
  },
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background.default,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  contentContainerScroll: {
    // padding: 16,
  },
  textWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: 16,
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
  imagem: {
    width: "100%",
    height: 300,
    backgroundColor: colors.neutral.light,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold" as "bold",
    marginBottom: 8,
    color: colors.text.primary,
  },
  subtitulo: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 12,
    lineHeight: 22,
  },
  conteudo: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.primary,
    marginBottom: 12,
  },
  data: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  htmlBaseStyle: {
    color: colors.text.primary, // Cor de texto padrão para o HTML
    fontSize: 16, // Tamanho de fonte padrão para o HTML
    lineHeight: 24,
  },
  // autor não está presente na API, removido temporariamente
});

export default ExibeNoticia;
