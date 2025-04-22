import React from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";

interface LogoutButtonProps {
  onPress: () => void;
}

const LogoutButton = ({ onPress }: LogoutButtonProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.button}>
        <Ionicons
          name="log-out-outline"
          size={22}
          color={colors.status.error.main}
        />
        <Text style={styles.text}>Sair da conta</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingVertical: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    backgroundColor: `${colors.status.error.main}10`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.status.error.main}30`,
  },
  text: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: colors.status.error.main,
  },
});

export default LogoutButton;
