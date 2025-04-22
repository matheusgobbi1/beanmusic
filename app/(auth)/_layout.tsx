import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import colors from "../../src/constants/colors";

export default function AuthLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background.default }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.default },
          animation: "slide_from_right",
        }}
        initialRouteName="login"
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </View>
  );
}
