/**
 * Serviço para interação com a API do Spotify através do backend
 */

// Interface para faixa do Spotify
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  // Campos para compatibilidade com formato antigo
  image?: string;
  artist_name?: string;

  // Campos adicionais para outros formatos de API
  title?: string;
  artist?: string | { name: string };
  artwork?: string;
  cover?: string;
  url?: string;
}

// Interface para artista do Spotify
export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  followers: {
    total: number;
  };
  popularity: number;
  external_urls: {
    spotify: string;
  };
}

// Interface para resposta de pesquisa
export interface SearchResponse {
  tracks: SpotifyTrack[];
  totalResults: number;
}

/**
 * Pesquisa faixas no Spotify
 * @param query Termo de pesquisa
 * @param limit Número máximo de resultados
 * @returns Resposta com as faixas encontradas
 */
export const searchTracks = async (
  query: string,
  limit: number = 20
): Promise<SearchResponse> => {
  try {
    // Verifica se o query é válido antes de fazer a requisição
    if (!query || query.trim().length === 0) {
      console.log("Query vazia, retornando lista vazia");
      return {
        tracks: [],
        totalResults: 0,
      };
    }

    const response = await fetch(
      `https://app.beanmusicpromotion.com/api/spotify/search?q=${encodeURIComponent(
        query
      )}&type=track&limit=${limit}`
    );

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      console.error(
        `Erro na resposta da API: ${response.status} ${response.statusText}`
      );
      throw new Error(`Erro na API: ${response.status}`);
    }

    // Verifica o tipo de conteúdo da resposta
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error(`Tipo de conteúdo inesperado: ${contentType}`);

      // Tenta ler o texto da resposta para diagnóstico
      const text = await response.text();
      console.log(
        "Resposta não-JSON recebida:",
        text.substring(0, 200) + "..."
      );

      throw new Error(`Resposta não é JSON válido: ${contentType}`);
    }

    // Agora é seguro fazer o parse do JSON
    const data = await response.json();

    // Log dos dados brutos para debug
    console.log("Dados brutos da API:", JSON.stringify(data, null, 2));

    // Trata o caso de data ser null ou undefined
    if (!data || !data.tracks) {
      console.error("Dados inválidos recebidos da API:", data);
      return {
        tracks: [],
        totalResults: 0,
      };
    }

    // Garante que cada track tenha os campos necessários
    const tracks = data.tracks?.items || [];
    const validatedTracks = tracks.map((track: any) => {
      // Se a track já tiver um campo image de outro formato, vamos usar
      const existingImage = track.image || track.artwork || track.cover || "";

      // Extrair nome do artista diretamente do campo, se disponível
      let artistName = "";
      if (track.artist_name) {
        artistName = track.artist_name;
      } else if (track.artist) {
        artistName = typeof track.artist === "string" ? track.artist : "";
      }

      // Extrair artistas
      const artists = Array.isArray(track.artists)
        ? track.artists.map((artist: any) => ({
            id: artist.id || "",
            name: artist.name || "Artista desconhecido",
          }))
        : artistName
        ? [{ id: "", name: artistName }]
        : [];

      // Extrair nome do artista para compatibilidade com formato antigo
      const artist_name =
        artistName ||
        (artists.length > 0
          ? artists.map((a: any) => a.name).join(", ")
          : "Artista desconhecido");

      // Extrair URL da imagem para compatibilidade com formato antigo
      let image = existingImage;
      if (!image && track.album?.images && track.album.images.length > 0) {
        image = track.album.images[0]?.url || "";
      }

      return {
        id: track.id || "",
        name: track.name || track.title || "Faixa desconhecida",
        artists: artists,
        album: {
          id: track.album?.id || "",
          name: track.album?.name || "Álbum desconhecido",
          images: Array.isArray(track.album?.images) ? track.album.images : [],
        },
        duration_ms: track.duration_ms || 0,
        preview_url: track.preview_url || null,
        external_urls: {
          spotify: track.external_urls?.spotify || track.url || "",
        },
        // Campos de compatibilidade
        image: image,
        artist_name: artist_name,
      };
    });

    return {
      tracks: validatedTracks,
      totalResults: data.tracks?.total || 0,
    };
  } catch (error) {
    console.error("Erro ao pesquisar faixas:", error);
    // Retorna um objeto vazio em vez de lançar o erro
    return {
      tracks: [],
      totalResults: 0,
    };
  }
};

/**
 * Obtém informações detalhadas sobre um artista
 * @param artistId ID do artista no Spotify
 * @returns Dados do artista
 */
export const getArtistDetails = async (
  artistId: string
): Promise<SpotifyArtist | null> => {
  try {
    const response = await fetch(
      `https://app.beanmusicpromotion.com/api/spotify/artist?artistId=${artistId}`
    );

    if (!response.ok) {
      throw new Error(`Erro ao obter artista: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao obter detalhes do artista:", error);
    return null;
  }
};

/**
 * Formata duração em milissegundos para formato mm:ss
 * @param durationMs Duração em milissegundos
 * @returns String formatada no formato mm:ss
 */
export const formatDuration = (durationMs: number): string => {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
