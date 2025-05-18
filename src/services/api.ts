import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { API_URL } from "@env";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

console.log("API_URL CARREGADA:", API_URL);

// Defina uma interface para o erro de resposta da API se necessário
interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

// Interface para resposta da verificação de cupom
export interface CouponVerifyResponse {
  authorize: boolean; // API retorna "authorize" em vez de "isValid"
  type?: 'fixed' | 'percent'; // Tipo de desconto: fixed (valor fixo) ou percent (percentual)
  value?: number; // Valor do desconto (fixo ou percentual)
  code?: string; // Campo opcional se a API retornar
  message?: string; // Campo opcional se a API retornar
}

// Crie a instância do axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // timeout de 10 segundos
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Função para buscar o token utilizando SecureStore ou AsyncStorage
const getToken = async (): Promise<string | null> => {
  try {
    // Primeiro tenta buscar do SecureStore (preferido)
    let token = await SecureStore.getItemAsync("userToken");

    // Se não encontrar, tenta do AsyncStorage como fallback
    if (!token) {
      token = await AsyncStorage.getItem("@BeanMusic:token");
    }

    return token;
  } catch (error) {
    console.error("[API] Erro ao obter token:", error);
    return null;
  }
};

// Interceptor para logar as requisições e adicionar o token ao header
api.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    const token = await getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError): Promise<never> => {
    console.error("[API] Erro na requisição:", error);
    return Promise.reject(error);
  }
);

// Função auxiliar para lidar com logout
const handleLogout = async (): Promise<void> => {
  try {
    // Remove tokens de ambos os storages
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userData");
    await AsyncStorage.multiRemove(["@BeanMusic:token", "@BeanMusic:user"]);

    // Redirecionar para a tela de login
    router.replace("/login");
  } catch (error) {
    console.error("[API] Erro ao fazer logout:", error);
  }
};

// Interceptor para logar as respostas e tratar erros, como o 401
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>): Promise<never> => {
    if (error.response?.status === 401) {
      console.warn("[API] Token inválido ou expirado. Removendo token...");
      await handleLogout();
    }

    return Promise.reject(error);
  }
);

// Funções relacionadas a cupons
export const couponsAPI = {
  // Verificar um código de cupom
  verifyCoupon: async (code: string): Promise<CouponVerifyResponse> => {
    try {
      console.log(`[API] Verificando cupom: ${code}`);
      // Usando "Campanhas" como o serviço
      const response = await api.get(`/coupon/verify?service=Campanhas&q=${encodeURIComponent(code)}`);
      
      // Log detalhado da resposta
      console.log(`[API] Resposta da verificação do cupom:`, JSON.stringify(response.data, null, 2));
      
      // Log detalhado dos campos específicos
      if (response.data) {
        console.log(`[API] Detalhes do cupom:`);
        console.log(`- Válido: ${response.data.authorize}`);
        console.log(`- Tipo: ${response.data.type} (${response.data.type === 'fixed' ? 'Valor fixo' : 'Percentual'})`);
        console.log(`- Valor: ${response.data.value}${response.data.type === 'percent' ? '%' : ' BRL'}`);
      }
      
      return response.data;
    } catch (error) {
      console.error(`[API] Erro ao verificar cupom: ${code}`, error);
      // Retorna objeto de erro formatado para facilitar tratamento
      return {
        authorize: false,
        message: "Erro ao verificar cupom. Tente novamente.",
      };
    }
  },
};

// Funções relacionadas às campanhas
export const campanhasAPI = {
  // Listar campanhas do usuário atual
  getUserCampaigns: async () => {
    try {
      const response = await api.get("/me/campaigns");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar campanhas do usuário:", error);
      throw error;
    }
  },

  // Obter detalhes de uma campanha específica
  getCampaignDetails: async (campaignId: string) => {
    try {
      console.log(
        `[API] Iniciando requisição para /me/campaigns/${campaignId}`
      );

      const response = await api.get(`/me/campaigns/${campaignId}`);

      console.log(`[API] Status da resposta: ${response.status}`);
      console.log(
        `[API] Resposta completa:`,
        JSON.stringify(response.data, null, 2)
      );

      // Verificar e adaptar a estrutura da resposta se necessário
      const data = response.data;

      // Verificar se o formato das atividades está correto
      if (data.atividades) {
        console.log(
          `[API] Formato das atividades recebidas:`,
          JSON.stringify(data.atividades[0], null, 2)
        );
      }

      // Verificar se o formato das playlists está correto
      if (data.playlists) {
        console.log(
          `[API] Formato das playlists recebidas:`,
          JSON.stringify(data.playlists[0], null, 2)
        );
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `[API] Erro ao buscar detalhes da campanha ${campaignId}: ${error.message}`,
          error
        );
      } else {
        console.error(
          `[API] Erro desconhecido ao buscar detalhes da campanha ${campaignId}`,
          error
        );
      }

      // Relançar o erro para ser tratado pelo componente
      throw error;
    }
  },

  // Criar uma nova campanha
  createCampaign: async (campaignData: any) => {
    try {
      const response = await api.post("/me/campaigns", campaignData);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar campanha:", error);
      throw error;
    }
  },
};

// Funções relacionadas ao Blog
export const blogAPI = {
  // Obter uma notícia específica pelo slug
  getNoticiaBySlug: async (slug: string) => {
    try {
      console.log(`[API] Iniciando requisição para /blog/${slug}`);
      const response = await api.get(`/blog/${slug}`);
      console.log(`[API] Status da resposta: ${response.status}`);
      console.log(
        `[API] Resposta completa:`,
        JSON.stringify(response.data, null, 2)
      );
      return response.data; // Assumindo que a API retorna diretamente o objeto da notícia
    } catch (error) {
      // O interceptor de resposta global já deve lidar com erros comuns (como 401)
      // Aqui, podemos logar o erro específico desta chamada
      if (error instanceof Error) {
        console.error(
          `[API] Erro ao buscar notícia com slug ${slug}: ${error.message}`,
          error
        );
      } else {
        console.error(
          `[API] Erro desconhecido ao buscar notícia com slug ${slug}`,
          error
        );
      }
      throw error; // Relançar o erro para ser tratado pelo componente que fez a chamada
    }
  },
  // Obter todas as notícias
  getTodasNoticias: async () => {
    try {
      console.log("[API] Iniciando requisição para /blog (todas as notícias)");
      const response = await api.get("/blog");
      console.log(`[API] Status da resposta: ${response.status}`);
      // Assumindo que a API retorna um array de notícias
      // console.log(
      //   `[API] Resposta completa (todas as notícias):`,
      //   JSON.stringify(response.data, null, 2)
      // );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `[API] Erro ao buscar todas as notícias: ${error.message}`,
          error
        );
      } else {
        console.error(
          `[API] Erro desconhecido ao buscar todas as notícias`,
          error
        );
      }
      throw error;
    }
  },
};

export default api;
