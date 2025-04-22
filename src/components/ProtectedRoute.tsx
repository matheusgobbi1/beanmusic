import { useAuth } from "../contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { ReactNode, useEffect, Fragment } from "react";
import { router } from "expo-router";
import colors from "../constants/colors";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { state } = useAuth();

  // Efeito para redirecionar o usuário se não estiver autenticado
  useEffect(() => {
    const checkAuth = async () => {
      // Se o usuário não estiver autenticado e a verificação da sessão estiver concluída
      if (!state.isLoading && !state.isAuthenticated) {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [state.isAuthenticated, state.isLoading]);

  // Exibir um indicador de carregamento enquanto verifica a autenticação
  if (state.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.neutral.black,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  // Se o usuário estiver autenticado, renderiza os filhos
  if (state.isAuthenticated) {
    return <Fragment>{children}</Fragment>;
  }

  // Este retorno só é atingido durante o redirecionamento
  return null;
}
