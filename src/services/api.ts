import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { API_URL } from "@env";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Defina uma interface para o erro de resposta da API se necessário
interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
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
      const response = await api.get(`/me/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Erro ao buscar detalhes da campanha ${campaignId}:`,
        error
      );
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

export default api;
