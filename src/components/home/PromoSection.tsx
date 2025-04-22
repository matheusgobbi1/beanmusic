import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../constants/colors";

export interface Promotion {
  id: string;
  title: string;
  description: string;
  bgColor: readonly [string, string];
  icon: React.ComponentProps<typeof Ionicons>["name"];
  imageUrl?: string;
  onPress?: () => void;
}

interface PromoSectionProps {
  promotions: Promotion[];
  title?: string;
}

export default function PromoSection({
  promotions = [],
  title = "Promoções",
}: PromoSectionProps) {
  const screenWidth = Dimensions.get("window").width;
  const cardWidth = (screenWidth - 48) / 2; // 2 cards por linha com espaçamento

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.cardsContainer}>
        {promotions.map((promo) => (
          <TouchableOpacity
            key={promo.id}
            style={[styles.card, { width: cardWidth }]}
            onPress={promo.onPress}
          >
            <LinearGradient
              colors={promo.bgColor}
              style={styles.cardBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name={promo.icon} size={24} color="#fff" />
              </View>

              <Text style={styles.promoTitle}>{promo.title}</Text>
              <Text style={styles.promoDescription} numberOfLines={2}>
                {promo.description}
              </Text>
            </View>

            {promo.imageUrl && (
              <Image
                source={{ uri: promo.imageUrl }}
                style={styles.promoImage}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
    paddingTop: 8,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    height: 150,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  cardBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  cardContent: {
    padding: 16,
    height: "100%",
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  promoDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  promoImage: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 60,
    height: 60,
    opacity: 0.8,
  },
});
