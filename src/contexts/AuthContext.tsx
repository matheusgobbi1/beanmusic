import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import {
  User,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
} from "../services/authService";
import { router } from "expo-router";

// Definição de tipos para o estado e ações
type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
};

type AuthAction =
  | { type: "LOGIN_REQUEST" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "RESTORE_SESSION"; payload: User | null }
  | { type: "REGISTER_REQUEST" }
  | { type: "REGISTER_SUCCESS"; payload: User }
  | { type: "REGISTER_FAILURE"; payload: string }
  | { type: "CLEAR_ERROR" };

// Criação do contexto
type AuthContextType = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Estado inicial
const initialState: AuthState = {
  user: null,
  isLoading: true, // Inicialmente true para verificar a sessão
  error: null,
  isAuthenticated: false,
};

// Reducer para gerenciar o estado
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_REQUEST":
    case "REGISTER_REQUEST":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null,
      };
    case "LOGIN_FAILURE":
    case "REGISTER_FAILURE":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
      };
    case "RESTORE_SESSION":
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: !!action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar sessão ao iniciar o app
  const checkAuthState = useCallback(async () => {
    try {
      const authStatus = await isAuthenticated();
      if (authStatus) {
        const user = await getCurrentUser();
        dispatch({ type: "RESTORE_SESSION", payload: user });
      } else {
        dispatch({ type: "RESTORE_SESSION", payload: null });
      }
    } catch (error) {
      dispatch({ type: "RESTORE_SESSION", payload: null });
    }
  }, []);

  // Efeito para verificar autenticação ao iniciar
  useCallback(() => {
    checkAuthState();
  }, [checkAuthState])();

  // Função para login
  const login = async (email: string, password: string) => {
    dispatch({ type: "LOGIN_REQUEST" });
    try {
      const user = await loginUser({ email, password });
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
      router.replace("/(tabs)"); // Redireciona para a tela principal após login
    } catch (error: any) {
      let errorMessage = "Falha na autenticação. Tente novamente.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Se houver uma mensagem específica na resposta da API, use-a
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
    }
  };

  // Função para registro
  const register = async (name: string, email: string, password: string) => {
    dispatch({ type: "REGISTER_REQUEST" });
    try {
      const user = await registerUser({ name, email, password });
      dispatch({ type: "REGISTER_SUCCESS", payload: user });
      router.replace("/(tabs)"); // Redireciona para a tela principal após registro
    } catch (error) {
      let errorMessage = "Falha no registro. Tente novamente.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: "REGISTER_FAILURE", payload: errorMessage });
    }
  };

  // Função para logout
  const logout = async () => {
    try {
      await logoutUser();
      dispatch({ type: "LOGOUT" });
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Função para limpar erros
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <AuthContext.Provider
      value={{ state, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
