import { View, StyleSheet } from "react-native";
import Header from "../../src/components/common/Header";
import colors from "../../src/constants/colors";
import FeedNoticias from "../../src/components/blog/FeedNoticias";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Criando uma instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutos
      gcTime: 60 * 60 * 1000,    // 1 hora 
      retry: 1,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export default function Blog() {
  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <Header title="Blog" showLogo={true} rightIcon="search-outline" />
        <FeedNoticias />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
});
