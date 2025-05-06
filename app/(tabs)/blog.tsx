import { View, StyleSheet } from "react-native";
import Header from "../../src/components/common/Header";
import colors from "../../src/constants/colors";
import FeedNoticias from "../../src/components/blog/FeedNoticias";

export default function Blog() {
  return (
    <View style={styles.container}>
      <Header title="Blog" showLogo={true} rightIcon="search-outline" />
      <FeedNoticias />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
});
