import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../constants/colors";

// Habilitar LayoutAnimation no Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export interface Playlist {
  id: string;
  nome: string;
  imageUrl: string;
  seguidores: string;
  aceitouEm: string;
  nota?: number;
  avaliacao?: string;
  curador?: string;
  status?: string;
}

interface PlaylistCardProps {
  playlist: Playlist;
  initialExpanded?: boolean;
}

// Função para garantir que valores sejam strings
const sanitizeText = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return JSON.stringify(value);
};

// Configurações para diferentes status
const statusConfig = {
  aceita: {
    color: colors.status.success.main,
    label: "Aceita",
    icon: "check",
  },
  pendente: {
    color: colors.status.warning.main,
    label: "Pendente",
    icon: "timer",
  },
  rejeitada: {
    color: colors.status.error.main,
    label: "Rejeitada",
    icon: "close",
  },
  default: {
    color: colors.text.secondary,
    label: "Em análise",
    icon: "assignment",
  },
};

const PlaylistCard = ({
  playlist,
  initialExpanded = false,
}: PlaylistCardProps) => {
  const [expanded, setExpanded] = useState(initialExpanded);

  const toggleExpand = () => {
    LayoutAnimation.configureNext({
      duration: 250,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    setExpanded(!expanded);
  };

  // Determinar a configuração de status
  const getStatusConfig = () => {
    if (!playlist.status) return statusConfig.default;

    const statusLower = playlist.status.toLowerCase();

    if (statusLower.includes("aceita")) return statusConfig.aceita;
    if (statusLower.includes("pendente") || statusLower.includes("análise"))
      return statusConfig.pendente;
    if (statusLower.includes("rejeitada") || statusLower.includes("recusada"))
      return statusConfig.rejeitada;

    return statusConfig.default;
  };

  const currentStatus = getStatusConfig();

  // Renderizar o ícone de status correto
  const renderStatusIcon = () => {
    let iconName: any = currentStatus.icon;

    // Garantir que usamos nomes de ícones válidos para o MaterialIcons
    if (currentStatus === statusConfig.aceita) {
      iconName = "check";
    } else if (currentStatus === statusConfig.pendente) {
      iconName = "timer";
    } else if (currentStatus === statusConfig.rejeitada) {
      iconName = "close";
    } else {
      iconName = "help";
    }

    return (
      <MaterialIcons name={iconName} size={16} color={currentStatus.color} />
    );
  };

  // Renderizar estrelas com base na nota
  const renderStars = () => {
    if (!playlist.nota) return null;

    // Garantir que a nota seja um número
    const notaNum =
      typeof playlist.nota === "number"
        ? playlist.nota
        : parseFloat(String(playlist.nota)) || 0;

    const stars = [];
    const fullStars = Math.floor(notaNum);
    const hasHalfStar = notaNum % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons
            key={i}
            name="star"
            size={16}
            color={colors.status.warning.main}
            style={styles.starIcon}
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons
            key={i}
            name="star-half"
            size={16}
            color={colors.status.warning.main}
            style={styles.starIcon}
          />
        );
      } else {
        stars.push(
          <Ionicons
            key={i}
            name="star-outline"
            size={16}
            color={colors.status.warning.main}
            style={styles.starIcon}
          />
        );
      }
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  return (
    <View style={styles.playlistCard}>
      <TouchableOpacity
        onPress={toggleExpand}
        style={styles.playlistHeader}
        activeOpacity={0.7}
      >
        <View style={styles.playlistInfo}>
          <Image
            source={{ uri: playlist.imageUrl }}
            style={styles.playlistImage}
          />
          <View style={styles.playlistTitleContainer}>
            <Text
              style={styles.playlistTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {sanitizeText(playlist.nome)}
            </Text>
            <Text style={styles.playlistFollowers}>
              {sanitizeText(playlist.seguidores)} seguidores
            </Text>
          </View>
        </View>
        <View style={styles.iconsContainer}>
          {playlist.status && (
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${currentStatus.color}15` },
              ]}
            >
              {renderStatusIcon()}
            </View>
          )}
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${colors.primary.main}15` },
            ]}
          >
            <MaterialIcons
              name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={20}
              color={colors.primary.main}
            />
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <>
          <View style={styles.divider} />
          <View style={styles.playlistDetails}>
            <View style={styles.infoRow}>
              <Text style={styles.playlistFullName}>
                {sanitizeText(playlist.nome)}
              </Text>
            </View>

            <View style={styles.playlistDetailRow}>
              <Text style={styles.playlistDetailLabel}>Aceito em:</Text>
              <Text style={styles.playlistDetailValue}>
                {sanitizeText(playlist.aceitouEm)}
              </Text>
            </View>

            {playlist.curador && (
              <View style={styles.playlistDetailRow}>
                <Text style={styles.playlistDetailLabel}>Curador:</Text>
                <Text style={styles.playlistDetailValue}>
                  {sanitizeText(playlist.curador)}
                </Text>
              </View>
            )}

            {playlist.nota !== undefined && playlist.nota !== null && (
              <View style={styles.playlistDetailRow}>
                <Text style={styles.playlistDetailLabel}>Avaliação:</Text>
                {renderStars()}
              </View>
            )}

            {playlist.avaliacao && (
              <View style={styles.playlistDetailComment}>
                <Text style={styles.playlistCommentText}>
                  {sanitizeText(playlist.avaliacao)}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  playlistCard: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  playlistHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  playlistInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  playlistImage: {
    width: 56,
    height: 56,
    borderRadius: 6,
    marginRight: 12,
  },
  playlistTitleContainer: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  playlistFullName: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 16,
    paddingRight: 8,
  },
  playlistFollowers: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.default,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: 12,
  },
  playlistDetails: {
    padding: 16,
    paddingTop: 14,
  },
  playlistDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  playlistDetailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    width: 90,
  },
  playlistDetailValue: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  playlistDetailComment: {
    backgroundColor: `${colors.primary.main}10`,
    borderRadius: 8,
    padding: 14,
    marginTop: 6,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: `${colors.primary.main}40`,
  },
  playlistCommentText: {
    fontSize: 14,
    color: colors.text.primary,
    fontStyle: "italic",
    lineHeight: 20,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 2,
  },
});

export default PlaylistCard;
