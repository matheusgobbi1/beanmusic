import { Fragment } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router, Link } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../../src/components/common/Input";
import Button from "../../src/components/common/Button";
import colors from "../../src/constants/colors";
import { useMemo, useReducer } from "react";

// Definindo o estado inicial e o reducer para gerenciar o formulário
type FormState = {
  email: string;
  password: string;
  errors: {
    email: string;
    password: string;
  };
  touched: {
    email: boolean;
    password: boolean;
  };
};

type FormAction =
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_ERROR"; field: "email" | "password"; payload: string }
  | { type: "TOUCH_FIELD"; field: "email" | "password" }
  | { type: "RESET_FORM" };

const initialFormState: FormState = {
  email: "",
  password: "",
  errors: {
    email: "",
    password: "",
  },
  touched: {
    email: false,
    password: false,
  },
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_EMAIL":
      return {
        ...state,
        email: action.payload,
        errors: {
          ...state.errors,
          email: validateEmail(action.payload),
        },
      };
    case "SET_PASSWORD":
      return {
        ...state,
        password: action.payload,
        errors: {
          ...state.errors,
          password: validatePassword(action.payload),
        },
      };
    case "SET_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.payload,
        },
      };
    case "TOUCH_FIELD":
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.field]: true,
        },
      };
    case "RESET_FORM":
      return initialFormState;
    default:
      return state;
  }
}

// Funções de validação
function validateEmail(email: string): string {
  if (!email) return "O e-mail é obrigatório";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Formato de e-mail inválido";
  return "";
}

function validatePassword(password: string): string {
  if (!password) return "A senha é obrigatória";
  if (password.length < 6) return "A senha deve ter pelo menos 6 caracteres";
  return "";
}

export default function Login() {
  const { login, state } = useAuth();
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  // Validar se o formulário é válido
  const isFormValid = useMemo(() => {
    return (
      !formState.errors.email &&
      !formState.errors.password &&
      formState.email &&
      formState.password
    );
  }, [formState.errors, formState.email, formState.password]);

  // Handler para login
  const handleLogin = async () => {
    // Marcar todos os campos como tocados para mostrar erros
    dispatch({ type: "TOUCH_FIELD", field: "email" });
    dispatch({ type: "TOUCH_FIELD", field: "password" });

    if (isFormValid) {
      await login(formState.email, formState.password);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Bem-vindo de volta!</Text>
            <Text style={styles.welcomeSubtitle}>
              Acesse sua conta para continuar
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="E-mail"
              value={formState.email}
              onChangeText={(text) =>
                dispatch({ type: "SET_EMAIL", payload: text })
              }
              placeholder="Seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail-outline"
              error={formState.touched.email ? formState.errors.email : ""}
              inputStyle={styles.inputText}
              style={styles.inputContainer}
              labelStyle={styles.inputLabel}
              required
            />

            <Input
              label="Senha"
              value={formState.password}
              onChangeText={(text) =>
                dispatch({ type: "SET_PASSWORD", payload: text })
              }
              placeholder="Sua senha"
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={
                formState.touched.password ? formState.errors.password : ""
              }
              inputStyle={styles.inputText}
              style={styles.inputContainer}
              labelStyle={styles.inputLabel}
              required
            />

            {state.error && <Text style={styles.authError}>{state.error}</Text>}

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              activeOpacity={0.7}
              onPress={() => router.push("/recuperar-senha")}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            <Button
              title="Entrar"
              onPress={handleLogin}
              fullWidth
              loading={state.isLoading}
              disabled={!isFormValid}
              icon="log-in-outline"
              iconPosition="right"
            />
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Ainda não tem uma conta?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.registerLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.black,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 120,
  },
  welcomeContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.neutral.white,
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.neutral.light,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    marginBottom: 24,
  },
  inputText: {
    color: colors.neutral.white,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: colors.neutral.white,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.primary.light,
    fontSize: 14,
    fontWeight: "500",
  },
  authError: {
    color: colors.status.error.light,
    fontSize: 14,
    marginVertical: 8,
    textAlign: "center",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  registerText: {
    color: colors.neutral.light,
    fontSize: 14,
    marginRight: 5,
  },
  registerLink: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: "600",
  },
});
