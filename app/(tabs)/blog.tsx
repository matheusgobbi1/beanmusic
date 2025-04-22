import { View, Text, StyleSheet } from "react-native";
import Header from "../../src/components/common/Header";
import colors from "../../src/constants/colors";

export default function Blog() {
  return (
    <View style={styles.container}>
      <Header title="Blog" showLogo={true} rightIcon="search-outline" />
      <View style={styles.content}>
        <Text style={styles.title}>Bean Music</Text>
        <Text style={styles.subtitle}>Blog</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 18,
    color: colors.primary.main,
  },
});
