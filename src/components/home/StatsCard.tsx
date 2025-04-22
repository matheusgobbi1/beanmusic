import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";

interface StatsCardProps {
  totalCampaigns?: number;
  activeCampaigns?: number;
  totalListeners?: number;
}

export default function StatsCard({
  totalCampaigns = 0,
  activeCampaigns = 0,
  totalListeners = 0,
}: StatsCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Suas estatísticas</Text>
        <View style={styles.iconContainer}>
          <Ionicons name="analytics" size={18} color={colors.primary.main} />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Ionicons name="musical-notes" size={18} color="#fff" />
          </View>
          <Text style={styles.statValue}>{totalCampaigns}</Text>
          <Text style={styles.statLabel}>Campanhas</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, styles.activeIcon]}>
            <Ionicons name="pulse" size={18} color="#fff" />
          </View>
          <Text style={styles.statValue}>{activeCampaigns}</Text>
          <Text style={styles.statLabel}>Ativas</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <View style={[styles.statIconContainer, styles.listenersIcon]}>
            <Ionicons name="headset" size={18} color="#fff" />
          </View>
          <Text style={styles.statValue}>
            {totalListeners > 999
              ? `${(totalListeners / 1000).toFixed(1)}k`
              : totalListeners}
          </Text>
          <Text style={styles.statLabel}>Ouvintes</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.background.paper,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${colors.primary.main}15`,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  activeIcon: {
    backgroundColor: colors.status.success.main,
  },
  listenersIcon: {
    backgroundColor: colors.status.info.main,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border.light,
  },
});
