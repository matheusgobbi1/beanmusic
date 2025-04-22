import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import { BlurView } from "expo-blur";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatar?: string;
  fixed?: boolean;
}

const ProfileHeader = ({
  name,
  email,
  avatar,
  fixed = false,
}: ProfileHeaderProps) => {
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <View style={[styles.container, fixed && styles.fixedContainer]}>
      {fixed && (
        <BlurView
          intensity={50}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
        <View style={styles.editAvatarButton}>
          <Ionicons name="camera" size={16} color={colors.text.onDark} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.emailContainer}>
          <Ionicons
            name="mail-outline"
            size={14}
            color={colors.text.secondary}
          />
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    alignItems: "center",
    paddingVertical: 16,
  },
  fixedContainer: {
    width: "100%",
    backgroundColor: "rgba(2, 2, 2, 0.0)",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary.main,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary.light,
  },
  avatarText: {
    color: colors.primary.contrast,
    fontSize: 36,
    fontWeight: "bold",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.main,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background.default,
  },
  infoContainer: {
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  email: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 4,
  },
});

export default ProfileHeader;
