import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import colors from "../../constants/colors";

export type CampanhaStatus = "pending" | "active" | "completed" | "rejected";

interface CampanhaCardProps {
  id: string;
  title: string;
  platform: string;
  status: CampanhaStatus;
  date: string;
  imageUrl?: string;
  artist?: string;
}

const statusInfo = {
  pending: {
    color: colors.status.warning.main,
    text: "Pendente",
    icon: "time-outline" as const,
  },
  active: {
    color: colors.status.success.main,
    text: "Ativa",
    icon: "checkmark-circle-outline" as const,
  },
  completed: {
    color: colors.status.info.main,
    text: "Concluída",
    icon: "trophy-outline" as const,
  },
  rejected: {
    color: colors.status.error.main,
    text: "Rejeitada",
    icon: "close-circle-outline" as const,
  },
};

const platformInfo = {
  spotify: {
    color: "#1DB954",
    icon: "spotify" as const,
  },
  youtube: {
    color: "#FF0000",
    icon: "youtube-play" as const,
  },
  tiktok: {
    color: "#000000",
    icon: "music" as const,
  },
  instagram: {
    color: "#C13584",
    icon: "instagram" as const,
  },
};

const CampanhaCard = ({
  id,
  title,
  platform,
  status,
  date,
  imageUrl,
  artist,
}: CampanhaCardProps) => {
  const router = useRouter();
  const statusConfig = statusInfo[status];
  const platformConfig =
    platformInfo[platform as keyof typeof platformInfo] || platformInfo.spotify;

  // Processar a data para remover o dia
  const formattedDate = date.includes("/")
    ? date.split("/").slice(1).join("/")
    : date;

  const handlePress = () => {
    router.push(`/campanhas/${id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      {imageUrl ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
        >
          <View
            style={[
              styles.platformBadge,
              { backgroundColor: platformConfig.color },
            ]}
          >
            <FontAwesome name={platformConfig.icon} size={14} color="#FFFFFF" />
          </View>

          <View style={styles.contentWrapper}>
            <LinearGradient
              colors={[
                "transparent",
                "rgba(0,0,0,0.2)",
                "rgba(0,0,0,0.5)",
                "rgba(0,0,0,0.7)",
                "rgba(0,0,0,0.85)",
                "rgba(0,0,0,0.95)",
              ]}
              style={styles.gradient}
            />
            <MaskedView
              style={styles.blurOverlay}
              maskElement={
                <LinearGradient
                  colors={[
                    "rgba(0,0,0,1)",
                    "rgba(0,0,0,1)",
                    "rgba(0,0,0,1)",
                    "rgba(0,0,0,0.95)",
                    "rgba(0,0,0,0.85)",
                    "rgba(0,0,0,0.6)",
                    "rgba(0,0,0,0.2)",
                    "transparent",
                  ]}
                  style={{ flex: 1 }}
                  start={{ x: 0.5, y: 1 }}
                  end={{ x: 0.5, y: 0 }}
                />
              }
            >
              <BlurView intensity={30} tint="dark" style={styles.fullSize} />
            </MaskedView>

            <View style={styles.content}>
              <View>
                <Text style={styles.titleWithImage} numberOfLines={1}>
                  {title}
                </Text>
                {artist && (
                  <Text style={styles.artistWithImage} numberOfLines={1}>
                    {artist}
                  </Text>
                )}
              </View>
              <View style={styles.footer}>
                <Text style={styles.dateWithImage}>{formattedDate}</Text>
                <View
                  style={[
                    styles.statusContainer,
                    {
                      backgroundColor: `${statusConfig.color}40`,
                      borderColor: `${statusConfig.color}60`,
                    },
                  ]}
                >
                  <Ionicons
                    name={statusConfig.icon}
                    size={14}
                    color={statusConfig.color}
                  />
                  <Text style={[styles.status, { color: statusConfig.color }]}>
                    {statusConfig.text}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={styles.placeholderContainer}>
          <View style={styles.placeholderImage}>
            <Ionicons
              name="musical-notes"
              size={40}
              color={colors.primary.light}
            />
          </View>

          <View
            style={[
              styles.platformBadge,
              { backgroundColor: platformConfig.color },
            ]}
          >
            <FontAwesome name={platformConfig.icon} size={14} color="#FFFFFF" />
          </View>

          <View style={styles.contentWithoutImage}>
            <View>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {artist && (
                <Text style={styles.artist} numberOfLines={1}>
                  {artist}
                </Text>
              )}
            </View>
            <View style={styles.footer}>
              <Text style={styles.date}>{formattedDate}</Text>
              <View
                style={[
                  styles.statusContainer,
                  {
                    backgroundColor: `${statusConfig.color}20`,
                    borderColor: `${statusConfig.color}40`,
                  },
                ]}
              >
                <Ionicons
                  name={statusConfig.icon}
                  size={14}
                  color={statusConfig.color}
                />
                <Text style={[styles.status, { color: statusConfig.color }]}>
                  {statusConfig.text}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    height: 190,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },
  imageStyle: {
    borderRadius: 12,
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.background.paper,
    position: "relative",
  },
  placeholderImage: {
    width: "100%",
    height: "70%",
    backgroundColor: colors.primary.light + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  platformBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    zIndex: 10,
  },
  contentWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  gradient: {
    position: "absolute",
    left:0,
    right: 0,
    top: -40,
    height: 140,
    zIndex: 1,
  },
  blurOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: -50,
    height: 140,
    zIndex: 2,
    opacity: 1,
    overflow: "hidden",
  },
  content: {
    padding: 8,
    paddingBottom: 10,
    justifyContent: "space-between",
    height: "100%",
    zIndex: 3,
  },
  contentWithoutImage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    height: 90,
    justifyContent: "space-between",
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderColor: colors.border.light,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  artist: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  titleWithImage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  artistWithImage: {
    fontSize: 14,
    color: "#FFFFFFCC",
    marginBottom: 1,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  dateWithImage: {
    fontSize: 12,
    color: "#FFFFFFBB",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  status: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  maskElement: {
    flex: 1,
    backgroundColor: "transparent",
  },
  fullSize: {
    flex: 1,
  },
});

export default CampanhaCard;
