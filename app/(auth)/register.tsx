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
import { Link } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../../src/components/common/Input";
import Button from "../../src/components/common/Button";
import colors from "../../src/constants/colors";
import { useMemo, useReducer } from "react";

// Definindo o estado inicial e o reducer para gerenciar o formulário
type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  errors: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  touched: {
    name: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  };
};

type FormAction =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_CONFIRM_PASSWORD"; payload: string }
  | { type: "SET_ERROR"; field: keyof FormState["errors"]; payload: string }
  | { type: "TOUCH_FIELD"; field: keyof FormState["touched"] }
  | { type: "RESET_FORM" };

const initialFormState: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  errors: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
  touched: {
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  },
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_NAME":
      return {
        ...state,
        name: action.payload,
        errors: {
          ...state.errors,
          name: validateName(action.payload),
        },
      };
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
          confirmPassword: validateConfirmPassword(
            action.payload,
            state.confirmPassword
          ),
        },
      };
    case "SET_CONFIRM_PASSWORD":
      return {
        ...state,
        confirmPassword: action.payload,
        errors: {
          ...state.errors,
          confirmPassword: validateConfirmPassword(
            state.password,
            action.payload
          ),
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
function validateName(name: string): string {
  if (!name) return "O nome é obrigatório";
  if (name.length < 3) return "O nome deve ter pelo menos 3 caracteres";
  return "";
}

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

function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string {
  if (!confirmPassword) return "A confirmação de senha é obrigatória";
  if (password !== confirmPassword) return "As senhas não coincidem";
  return "";
}

export default function Register() {
  const { register, state } = useAuth();
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  // Validar se o formulário é válido
  const isFormValid = useMemo(() => {
    return (
      !formState.errors.name &&
      !formState.errors.email &&
      !formState.errors.password &&
      !formState.errors.confirmPassword &&
      formState.name &&
      formState.email &&
      formState.password &&
      formState.confirmPassword
    );
  }, [
    formState.errors,
    formState.name,
    formState.email,
    formState.password,
    formState.confirmPassword,
  ]);

  // Handler para registro
  const handleRegister = async () => {
    // Marcar todos os campos como tocados para mostrar erros
    dispatch({ type: "TOUCH_FIELD", field: "name" });
    dispatch({ type: "TOUCH_FIELD", field: "email" });
    dispatch({ type: "TOUCH_FIELD", field: "password" });
    dispatch({ type: "TOUCH_FIELD", field: "confirmPassword" });

    if (isFormValid) {
      await register(formState.name, formState.email, formState.password);
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
            <Text style={styles.welcomeTitle}>Crie sua conta</Text>
            <Text style={styles.welcomeSubtitle}>
              Preencha os dados abaixo para começar
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Nome"
              value={formState.name}
              onChangeText={(text) =>
                dispatch({ type: "SET_NAME", payload: text })
              }
              placeholder="Seu nome completo"
              autoCapitalize="words"
              autoComplete="name"
              leftIcon="person-outline"
              error={formState.touched.name ? formState.errors.name : ""}
              inputStyle={styles.inputText}
              style={styles.inputContainer}
              labelStyle={styles.inputLabel}
              required
            />

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

            <Input
              label="Confirmar Senha"
              value={formState.confirmPassword}
              onChangeText={(text) =>
                dispatch({ type: "SET_CONFIRM_PASSWORD", payload: text })
              }
              placeholder="Confirme sua senha"
              secureTextEntry
              leftIcon="shield-checkmark-outline"
              error={
                formState.touched.confirmPassword
                  ? formState.errors.confirmPassword
                  : ""
              }
              inputStyle={styles.inputText}
              style={styles.inputContainer}
              labelStyle={styles.inputLabel}
              required
            />

            {state.error && <Text style={styles.authError}>{state.error}</Text>}

            <Button
              title="Cadastrar"
              onPress={handleRegister}
              fullWidth
              loading={state.isLoading}
              disabled={!isFormValid}
              icon="person-add-outline"
              iconPosition="right"
            />
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.loginLink}>Faça login</Text>
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: colors.neutral.white,
  },
  inputText: {
    color: colors.neutral.white,
  },
  authError: {
    color: colors.status.error.light,
    fontSize: 14,
    marginVertical: 8,
    textAlign: "center",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    color: colors.neutral.light,
    fontSize: 14,
    marginRight: 5,
  },
  loginLink: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: "600",
  },
});
