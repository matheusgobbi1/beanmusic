/**
 * Bean Music - Paleta de Cores
 * Baseado na cor primária: #EA7730 (Laranja Bean)
 * Tema escuro com laranja como destaque
 */

const colors = {
  // Cores principais
  primary: {
    light: "#F09D65", // Versão mais clara da primária
    main: "#EA7730", // Cor primária principal (laranja)
    dark: "#C35F25", // Versão mais escura da primária
    contrast: "#FFFFFF", // Texto sobre fundo primário
  },

  // Cor secundária (complementar)
  secondary: {
    light: "#5AA0D9", // Azul claro
    main: "#3B7FC2", // Azul médio (complementar ao laranja)
    dark: "#2765A6", // Azul escuro
    contrast: "#FFFFFF", // Texto sobre fundo secundário
  },

  // Tons neutros
  neutral: {
    white: "#FFFFFF",
    lightest: "#F5F5F5",
    lighter: "#EEEEEE",
    light: "#E0E0E0",
    medium: "#CCCCCC",
    dark: "#999999",
    darker: "#666666",
    darkest: "#333333",
    black: "#000000",
  },

  // Cores de estado
  status: {
    success: {
      light: "#8FEABC",
      main: "#46C982",
      dark: "#30A866",
      contrast: "#FFFFFF",
    },
    warning: {
      light: "#FFCC80",
      main: "#FFA726",
      dark: "#E68900",
      contrast: "#FFFFFF",
    },
    error: {
      light: "#FF8A80",
      main: "#FF5252",
      dark: "#D50000",
      contrast: "#FFFFFF",
    },
    info: {
      light: "#80D8FF",
      main: "#29B6F6",
      dark: "#0288D1",
      contrast: "#FFFFFF",
    },
  },

  // Cores de background
  background: {
    default: "#1A1A1A", // Background padrão (escuro)
    paper: "#252525", // Background de cards (escuro)
    subtle: "#2A2A2A", // Background sutil para listas (escuro)
    inputField: "#333333", // Background de campos de entrada (escuro)
    disabled: "#444444", // Background desabilitado (escuro)
  },

  // Cores de texto
  text: {
    primary: "#FFFFFF", // Texto principal (branco para fundos escuros)
    secondary: "#CCCCCC", // Texto secundário (cinza claro)
    disabled: "#888888", // Texto desabilitado (cinza médio)
    hint: "#AAAAAA", // Texto de dicas (cinza claro)
    onDark: "#FFFFFF", // Texto sobre fundo escuro
    onLight: "#333333", // Texto sobre fundo claro
  },

  // Cores de borda
  border: {
    light: "#444444", // Borda clara (para tema escuro)
    main: "#555555", // Borda padrão (para tema escuro)
    dark: "#666666", // Borda escura (para tema escuro)
    focus: "#EA7730", // Borda de foco (cor primária laranja)
  },

  // Cores específicas para elementos de UI
  ui: {
    divider: "#444444", // Divisor (para tema escuro)
    shadow: "rgba(0, 0, 0, 0.3)", // Sombra padrão (mais forte para tema escuro)
    overlay: "rgba(0, 0, 0, 0.7)", // Sobreposição para modais (mais escura)
    ripple: "rgba(234, 119, 48, 0.25)", // Efeito ripple (cor primária com opacidade)
    placeholder: "#777777", // Texto de placeholder (para tema escuro)
    skeleton: "#444444", // Cor de skeleton loading (para tema escuro)
  },

  // Cores específicas para navegação
  navigation: {
    tabActive: "#EA7730", // Tab ativa (cor primária laranja)
    tabInactive: "#AAAAAA", // Tab inativa (cinza claro para tema escuro)
    tabBackground: "#1A1A1A", // Fundo da tab bar (escuro)
    statusBar: "#000000", // Cor da barra de status (preto)
  },

  // Cores para gradientes
  gradient: {
    primary: ["#EA7730", "#F09D65"], // Gradiente primário
    secondary: ["#3B7FC2", "#5AA0D9"], // Gradiente secundário
    dark: ["#000000", "#333333"], // Gradiente escuro (mais escuro)
  },

  // Cores para players de música
  player: {
    trackBackground: "#444444", // Fundo da barra de progresso (para tema escuro)
    trackProgress: "#EA7730", // Progresso da barra (cor primária laranja)
    playerBackground: "#1A1A1A", // Fundo do player (escuro)
    controlMain: "#EA7730", // Controles principais (cor primária laranja)
    controlSecondary: "#AAAAAA", // Controles secundários (cinza claro para tema escuro)
  },

  // Cores para campanhas
  campaign: {
    active: "#46C982", // Campanha ativa
    pending: "#FFA726", // Campanha pendente
    completed: "#3B7FC2", // Campanha concluída
    draft: "#999999", // Campanha em rascunho
  },
};

export default colors;
