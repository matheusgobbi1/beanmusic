import { StyleSheet, ScrollView, Dimensions, View } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ProtectedRoute } from "../../src/components/ProtectedRoute";
import colors from "../../src/constants/colors";
import {
  ProfileHeader,
  OptionsSection,
  LogoutButton,
} from "../../src/components/profile";
import { useRouter } from "expo-router";

export default function Profile() {
  const { state, logout } = useAuth();
  const user = state.user;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Calcular o espaço necessário para a TabBar flutuante
  const tabBarHeight = 65; // Altura da TabBar
  const tabBarBottomMargin = insets.bottom > 0 ? insets.bottom + 10 : 30;
  const bottomSpacing = tabBarHeight + tabBarBottomMargin + 20; // Adicionar espaço extra

  // Altura do ProfileHeader para adicionar como paddingTop na ScrollView
  // Adicionar a altura do statusBar (insets.top) para respeitar a safe area
  const profileHeaderHeight = 130; // Altura aproximada do header

  if (!user) {
    return (
      <ProtectedRoute>
        <View style={{ flex: 1 }} />
      </ProtectedRoute>
    );
  }

  const accountOptions = [
    {
      title: "Editar Perfil",
      icon: "person-outline",
      description: "Altere seu nome, foto e informações pessoais",
      onPress: () => {},
    },
    {
      title: "Alterar Senha",
      icon: "key-outline",
      description: "Atualize sua senha de acesso",
      onPress: () => {},
    },
  ];

  const paymentOptions = [
    {
      title: "Métodos de Pagamento",
      icon: "card-outline",
      description: "Gerencie seus cartões e métodos de pagamento",
      onPress: () => {},
    },
    {
      title: "Histórico de Transações",
      icon: "receipt-outline",
      description: "Visualize seu histórico de pagamentos",
      onPress: () => router.push("/transacoes"),
    },
  ];

  const appOptions = [
    {
      title: "Notificações",
      icon: "notifications-outline",
      description: "Configure suas preferências de notificação",
      onPress: () => {},
    },
    {
      title: "Sobre o Bean",
      icon: "information-circle-outline",
      description: "Conheça mais sobre o Bean Music",
      onPress: () => {},
    },
    {
      title: "Ajuda e Suporte",
      icon: "help-circle-outline",
      description: "Entre em contato com nosso suporte",
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Container para o header considerando a safe area */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <ProfileHeader name={user.name} email={user.email} fixed={true} />
      </View>

      {/* Conteúdo rolável */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: profileHeaderHeight + insets.top,
            paddingBottom: bottomSpacing,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <OptionsSection title="Conta" options={accountOptions} />
        <OptionsSection title="Pagamentos" options={paymentOptions} />
        <OptionsSection title="Aplicativo" options={appOptions} />

        <LogoutButton onPress={logout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
});
