import * as SecureStore from "expo-secure-store";
import api from "./api";
import { router } from "expo-router";

// Tipos para autenticação
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  // Adicione mais campos conforme necessário
}

export interface AuthResponse {
  token: string;
  data: User;
}

// Serviço de autenticação
export const loginUser = async (
  credentials: LoginCredentials
): Promise<User> => {
  try {
    const response = await api.post<AuthResponse>("/auth", credentials);
    const { token, data } = response.data;

    // Salvar o token no SecureStore
    await SecureStore.setItemAsync("userToken", token);

    // Salvar os dados do usuário
    await SecureStore.setItemAsync("userData", JSON.stringify(data));

    return data;
  } catch (error) {
    console.error("[Auth] Erro ao fazer login:", error);
    throw error;
  }
};

export const registerUser = async (
  userData: LoginCredentials & { name: string }
): Promise<User> => {
  try {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    const { token, data } = response.data;

    // Salvar o token no SecureStore
    await SecureStore.setItemAsync("userToken", token);

    // Salvar os dados do usuário
    await SecureStore.setItemAsync("userData", JSON.stringify(data));

    return data;
  } catch (error) {
    console.error("[Auth] Erro ao registrar usuário:", error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    // Remover o token e dados do usuário
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userData");

    // Redirecionar para a tela de login
    router.replace("/login");
  } catch (error) {
    console.error("[Auth] Erro ao fazer logout:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userData = await SecureStore.getItemAsync("userData");
    if (!userData) return null;

    return JSON.parse(userData) as User;
  } catch (error) {
    console.error("[Auth] Erro ao obter usuário atual:", error);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await SecureStore.getItemAsync("userToken");
    return !!token;
  } catch (error) {
    console.error("[Auth] Erro ao verificar autenticação:", error);
    return false;
  }
};
