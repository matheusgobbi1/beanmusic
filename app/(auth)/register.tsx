import { Fragment, useReducer, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Keyboard,
  Animated,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../../src/components/common/Input";
import Button from "../../src/components/common/Button";
import colors from "../../src/constants/colors";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Definindo o estado inicial e o reducer para gerenciar o formulário
type FormState = {
  userType: "artist" | "curator" | "";
  name: string;
  email: string;
  spotifyEmail: string;
  phone: string;
  password: string;
  confirmPassword: string;
  currentStep: number;
  errors: {
    name: string;
    email: string;
    spotifyEmail: string;
    phone: string;
    password: string;
    confirmPassword: string;
  };
  touched: {
    name: boolean;
    email: boolean;
    spotifyEmail: boolean;
    phone: boolean;
    password: boolean;
    confirmPassword: boolean;
  };
};

type FormAction =
  | { type: "SET_USER_TYPE"; payload: "artist" | "curator" }
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_SPOTIFY_EMAIL"; payload: string }
  | { type: "SET_PHONE"; payload: string }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_CONFIRM_PASSWORD"; payload: string }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_ERROR"; field: keyof FormState["errors"]; payload: string }
  | { type: "TOUCH_FIELD"; field: keyof FormState["touched"] }
  | { type: "RESET_FORM" };

const initialFormState: FormState = {
  userType: "",
  name: "",
  email: "",
  spotifyEmail: "",
  phone: "",
  password: "",
  confirmPassword: "",
  currentStep: 1,
  errors: {
    name: "",
    email: "",
    spotifyEmail: "",
    phone: "",
    password: "",
    confirmPassword: "",
  },
  touched: {
    name: false,
    email: false,
    spotifyEmail: false,
    phone: false,
    password: false,
    confirmPassword: false,
  },
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_USER_TYPE":
      return {
        ...state,
        userType: action.payload,
      };
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
    case "SET_SPOTIFY_EMAIL":
      return {
        ...state,
        spotifyEmail: action.payload,
        errors: {
          ...state.errors,
          spotifyEmail: validateEmail(action.payload),
        },
      };
    case "SET_PHONE":
      return {
        ...state,
        phone: action.payload,
        errors: {
          ...state.errors,
          phone: validatePhone(action.payload),
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
    case "NEXT_STEP":
      return {
        ...state,
        currentStep: state.currentStep + 1,
      };
    case "PREV_STEP":
      return {
        ...state,
        currentStep: Math.max(1, state.currentStep - 1),
      };
    case "SET_STEP":
      return {
        ...state,
        currentStep: action.payload,
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

function validatePhone(phone: string): string {
  if (!phone) return "O telefone é obrigatório";
  if (phone.length < 10) return "Telefone inválido";
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

function calculatePasswordStrength(password: string): number {
  if (!password) return 0;

  let strength = 0;

  // Comprimento mínimo
  if (password.length >= 6) strength += 0.2;
  if (password.length >= 10) strength += 0.2;

  // Complexidade
  if (/[A-Z]/.test(password)) strength += 0.2; // Letra maiúscula
  if (/[a-z]/.test(password)) strength += 0.1; // Letra minúscula
  if (/[0-9]/.test(password)) strength += 0.2; // Número
  if (/[^A-Za-z0-9]/.test(password)) strength += 0.1; // Caractere especial

  // Limitar a 1
  return Math.min(1, strength);
}

function getPasswordStrengthColor(strength: number): string {
  if (strength < 0.3) return colors.status.error.main;
  if (strength < 0.6) return colors.status.warning.main;
  return colors.status.success.main;
}

function getPasswordStrengthText(strength: number): string {
  if (strength < 0.3) return "Fraca";
  if (strength < 0.6) return "Média";
  return "Forte";
}

export default function Register() {
  const { register, state } = useAuth();
  const router = useRouter();
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Animar quando o componente for montado
  useMemo(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Validar formulário de acordo com a etapa atual
  const isCurrentStepValid = useMemo(() => {
    switch (formState.currentStep) {
      case 1:
        return !!formState.userType;
      case 2:
        return (
          !formState.errors.name &&
          !formState.errors.email &&
          !formState.errors.spotifyEmail &&
          !formState.errors.phone &&
          !!formState.name &&
          !!formState.email &&
          !!formState.spotifyEmail &&
          !!formState.phone
        );
      case 3:
        return (
          !formState.errors.password &&
          !formState.errors.confirmPassword &&
          !!formState.password &&
          !!formState.confirmPassword
        );
      default:
        return false;
    }
  }, [formState]);

  // Validar se todo o formulário é válido
  const isFormValid = useMemo(() => {
    return (
      !!formState.userType &&
      !formState.errors.name &&
      !formState.errors.email &&
      !formState.errors.spotifyEmail &&
      !formState.errors.phone &&
      !formState.errors.password &&
      !formState.errors.confirmPassword &&
      !!formState.name &&
      !!formState.email &&
      !!formState.spotifyEmail &&
      !!formState.phone &&
      !!formState.password &&
      !!formState.confirmPassword
    );
  }, [formState]);

  // Funções para navegar entre etapas
  const nextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    if (formState.currentStep === 1 && formState.userType) {
      dispatch({ type: "NEXT_STEP" });
    } else if (formState.currentStep === 2 && isCurrentStepValid) {
      dispatch({ type: "NEXT_STEP" });
    }
  };

  const prevStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    dispatch({ type: "PREV_STEP" });
  };

  // Handler para registro
  const handleRegister = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    // Marcar todos os campos como tocados para mostrar erros
    dispatch({ type: "TOUCH_FIELD", field: "name" });
    dispatch({ type: "TOUCH_FIELD", field: "email" });
    dispatch({ type: "TOUCH_FIELD", field: "spotifyEmail" });
    dispatch({ type: "TOUCH_FIELD", field: "phone" });
    dispatch({ type: "TOUCH_FIELD", field: "password" });
    dispatch({ type: "TOUCH_FIELD", field: "confirmPassword" });

    if (isFormValid) {
      await register(formState.name, formState.email, formState.password);

      // Se o registro for bem-sucedido, avance para a etapa de verificação
      if (!state.error) {
        dispatch({ type: "SET_STEP", payload: 4 });
      }
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const getStepTitle = () => {
    switch (formState.currentStep) {
      case 1:
        return "Escolha seu perfil";
      case 2:
        return "Informações pessoais";
      case 3:
        return "Crie sua senha";
      case 4:
        return "Verifique seu e-mail";
      default:
        return "Crie sua conta";
    }
  };

  const getStepSubtitle = () => {
    switch (formState.currentStep) {
      case 1:
        return "Como você deseja utilizar o Bean Music?";
      case 2:
        return "Preencha seus dados para continuar";
      case 3:
        return "Escolha uma senha segura para sua conta";
      case 4:
        return "Enviamos um link de verificação para seu e-mail";
      default:
        return "Preencha os dados abaixo para começar";
    }
  };

  // Renderizar formulário de acordo com a etapa atual
  const renderFormStep = () => {
    switch (formState.currentStep) {
      case 1:
        return (
          <Animated.View
            style={[
              styles.formCard,
              {
                borderColor: colors.neutral.dark,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeOption,
                  formState.userType === "artist" && styles.selectedUserType,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {}
                  );
                  dispatch({ type: "SET_USER_TYPE", payload: "artist" });
                }}
              >
                <View style={styles.userTypeIconContainer}>
                  <Text style={styles.userTypeIcon}>🎵</Text>
                </View>
                <Text style={styles.userTypeText}>Artista</Text>
                <Text style={styles.userTypeDescription}>
                  Compartilhe sua música e conecte-se com curadores
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeOption,
                  formState.userType === "curator" && styles.selectedUserType,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {}
                  );
                  dispatch({ type: "SET_USER_TYPE", payload: "curator" });
                }}
              >
                <View style={styles.userTypeIconContainer}>
                  <Text style={styles.userTypeIcon}>🎧</Text>
                </View>
                <Text style={styles.userTypeText}>Curador</Text>
                <Text style={styles.userTypeDescription}>
                  Descubra novos artistas e crie playlists exclusivas
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                { backgroundColor: colors.primary.main },
                !formState.userType && styles.disabledButton,
              ]}
              onPress={nextStep}
              disabled={!formState.userType}
            >
              <Text style={styles.nextButtonText}>Continuar</Text>
              <Ionicons name="arrow-forward" size={22} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View
            style={[
              styles.formCard,
              {
                borderColor: colors.neutral.dark,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.formInnerContainer}>
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
                label="E-mail do Spotify"
                value={formState.spotifyEmail}
                onChangeText={(text) =>
                  dispatch({ type: "SET_SPOTIFY_EMAIL", payload: text })
                }
                placeholder="E-mail associado ao Spotify"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="musical-notes-outline"
                error={
                  formState.touched.spotifyEmail
                    ? formState.errors.spotifyEmail
                    : ""
                }
                inputStyle={styles.inputText}
                style={styles.inputContainer}
                labelStyle={styles.inputLabel}
                required
              />

              <Input
                label="Telefone"
                value={formState.phone}
                onChangeText={(text) =>
                  dispatch({ type: "SET_PHONE", payload: text })
                }
                placeholder="Seu número de telefone"
                keyboardType="phone-pad"
                leftIcon="call-outline"
                error={formState.touched.phone ? formState.errors.phone : ""}
                inputStyle={styles.inputText}
                style={styles.inputContainer}
                labelStyle={styles.inputLabel}
                required
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.backButton,
                    {
                      backgroundColor: "transparent",
                      borderColor: colors.neutral.light,
                    },
                  ]}
                  onPress={prevStep}
                >
                  <Ionicons
                    name="arrow-back"
                    size={22}
                    color={colors.neutral.white}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    { backgroundColor: colors.primary.main },
                    !isCurrentStepValid && styles.disabledButton,
                  ]}
                  onPress={nextStep}
                  disabled={!isCurrentStepValid}
                >
                  <Text style={styles.nextButtonText}>Continuar</Text>
                  <Ionicons name="arrow-forward" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View
            style={[
              styles.formCard,
              {
                borderColor: colors.neutral.dark,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.formInnerContainer}>
              <Input
                label="Senha"
                value={formState.password}
                onChangeText={(text) =>
                  dispatch({ type: "SET_PASSWORD", payload: text })
                }
                placeholder="Crie uma senha forte"
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

              {formState.password.length > 0 && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={styles.strengthBarContainer}>
                    <View
                      style={[
                        styles.strengthBar,
                        {
                          width: `${
                            calculatePasswordStrength(formState.password) * 100
                          }%`,
                          backgroundColor: getPasswordStrengthColor(
                            calculatePasswordStrength(formState.password)
                          ),
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.strengthText,
                      {
                        color: getPasswordStrengthColor(
                          calculatePasswordStrength(formState.password)
                        ),
                      },
                    ]}
                  >
                    {getPasswordStrengthText(
                      calculatePasswordStrength(formState.password)
                    )}
                  </Text>
                </View>
              )}

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

              {state.error && (
                <Text style={styles.authError}>{state.error}</Text>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.backButton,
                    {
                      backgroundColor: "transparent",
                      borderColor: colors.neutral.light,
                    },
                  ]}
                  onPress={prevStep}
                >
                  <Ionicons
                    name="arrow-back"
                    size={22}
                    color={colors.neutral.white}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    { backgroundColor: colors.primary.main },
                    !isCurrentStepValid && styles.disabledButton,
                  ]}
                  onPress={handleRegister}
                  disabled={!isCurrentStepValid || state.isLoading}
                >
                  <Text style={styles.registerButtonText}>
                    {state.isLoading ? "Cadastrando..." : "Cadastrar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View
            style={[
              styles.formCard,
              {
                borderColor: colors.neutral.dark,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.verificationContainer}>
              <View style={styles.emailIconContainer}>
                <Text style={styles.emailIcon}>✉️</Text>
              </View>

              <Text style={styles.verificationTitle}>Verifique seu e-mail</Text>

              <Text style={styles.verificationText}>
                Enviamos um link de verificação para{" "}
                <Text style={styles.verificationEmail}>{formState.email}</Text>.
                Clique no link para ativar sua conta.
              </Text>

              <TouchableOpacity
                style={[
                  styles.resendButton,
                  { borderColor: colors.primary.main },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {}
                  );
                  // Função para reenviar e-mail de verificação
                }}
              >
                <Text
                  style={[
                    styles.resendButtonText,
                    { color: colors.primary.main },
                  ]}
                >
                  Reenviar e-mail
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={dismissKeyboard}
            style={styles.touchableContainer}
          >
            {/* Header com título e subtítulo */}
            <Animated.View
              style={[
                styles.headerContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.headerTitle}>{getStepTitle()}</Text>

              <Text style={styles.headerSubtitle}>{getStepSubtitle()}</Text>
            </Animated.View>

            {/* Indicador de progresso */}
            <View style={styles.progressContainer}>
              {[1, 2, 3, 4].map((step) => (
                <View
                  key={`step-${step}`}
                  style={[
                    styles.progressStep,
                    {
                      backgroundColor:
                        formState.currentStep >= step
                          ? colors.primary.main
                          : colors.neutral.dark,
                      width: formState.currentStep === step ? 24 : 12,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Formulário */}
            <View style={styles.formContainer}>{renderFormStep()}</View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem uma conta?</Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.loginLink}>Faça login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.black,
    justifyContent: "center",
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "center",
    paddingTop: 40,
  },
  touchableContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: "center",
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.neutral.white,
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.neutral.light,
    textAlign: "center",
    maxWidth: "85%",
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    marginTop: 10,
    gap: 8,
  },
  progressStep: {
    height: 8,
    borderRadius: 4,
  },
  formContainer: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    marginBottom: 30,
    marginTop: 10,
  },
  formCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    backgroundColor: colors.neutral.black,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  formInnerContainer: {
    width: "100%",
    gap: 18,
  },
  userTypeContainer: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 20,
  },
  userTypeOption: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral.dark,
    alignItems: "center",
  },
  selectedUserType: {
    borderColor: colors.primary.main,
    backgroundColor: `${colors.primary.main}20`,
  },
  userTypeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${colors.primary.main}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  userTypeIcon: {
    fontSize: 30,
  },
  userTypeText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral.white,
    marginBottom: 8,
  },
  userTypeDescription: {
    fontSize: 14,
    color: colors.neutral.light,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 0,
  },
  inputLabel: {
    color: colors.neutral.white,
  },
  inputText: {
    color: colors.neutral.white,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  backButton: {
    padding: 14,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  backButtonText: {
    color: colors.neutral.white,
    fontWeight: "600",
    fontSize: 16,
  },
  nextButton: {
    padding: 16,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flex: 2,
    flexDirection: "row",
    gap: 8,
  },
  nextButtonText: {
    color: colors.neutral.white,
    fontWeight: "600",
    fontSize: 16,
  },
  registerButton: {
    padding: 16,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flex: 2,
  },
  registerButtonText: {
    color: colors.neutral.white,
    fontWeight: "600",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
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
    marginTop: 30,
    marginBottom: 20,
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
  passwordStrengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -10,
    marginBottom: 10,
  },
  strengthBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: colors.neutral.dark,
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthBar: {
    height: "100%",
  },
  strengthText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "bold",
  },
  verificationContainer: {
    alignItems: "center",
    padding: 16,
  },
  emailIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary.main}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emailIcon: {
    fontSize: 40,
  },
  verificationTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.neutral.white,
    marginBottom: 12,
  },
  verificationText: {
    fontSize: 15,
    color: colors.neutral.light,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  verificationEmail: {
    color: colors.neutral.white,
    fontWeight: "600",
  },
  resendButton: {
    padding: 14,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  resendButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
