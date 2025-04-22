import React, { createContext, useContext, useReducer } from "react";

// Tipos de plataforma suportados
export type PlatformType = "spotify" | "youtube" | "tiktok" | "instagram";

// Tipos de ação
type ActionType =
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "SET_PLATFORM"; payload: PlatformType }
  | { type: "SET_SELECTED_TRACK"; payload: any }
  | { type: "SET_TARGET_OPTIONS"; payload: TargetOptions }
  | { type: "SET_BUDGET"; payload: number }
  | { type: "RESET_CAMPAIGN" }
  | { type: "SET_OBSERVATION"; payload: string };

// Interface para opções de segmentação
export interface TargetOptions {
  genre?: string;
  language?: string;
  mood?: string[];
}

// Interface para o estado do contexto
export interface CampanhaState {
  currentStep: number;
  platform: PlatformType;
  selectedTrack: any;
  targetOptions: TargetOptions;
  budget: number;
  observation: string;
  totalSteps: number;
}

// Estado inicial
const initialState: CampanhaState = {
  currentStep: 1,
  platform: "spotify",
  selectedTrack: null,
  targetOptions: {
    genre: "",
    language: "",
    mood: [],
  },
  budget: 0,
  observation: "",
  totalSteps: 5, // Total de etapas no fluxo
};

// Reducer para gerenciar o estado
const campanhaReducer = (
  state: CampanhaState,
  action: ActionType
): CampanhaState => {
  switch (action.type) {
    case "SET_CURRENT_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_PLATFORM":
      return { ...state, platform: action.payload };
    case "SET_SELECTED_TRACK":
      return { ...state, selectedTrack: action.payload };
    case "SET_TARGET_OPTIONS":
      return {
        ...state,
        targetOptions: { ...state.targetOptions, ...action.payload },
      };
    case "SET_BUDGET":
      return { ...state, budget: action.payload };
    case "SET_OBSERVATION":
      return { ...state, observation: action.payload };
    case "RESET_CAMPAIGN":
      return initialState;
    default:
      return state;
  }
};

// Criação do contexto
interface CampanhaContextProps {
  state: CampanhaState;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setPlatform: (platform: PlatformType) => void;
  setSelectedTrack: (track: any) => void;
  setTargetOptions: (options: Partial<TargetOptions>) => void;
  setBudget: (budget: number) => void;
  setObservation: (observation: string) => void;
  resetCampaign: () => void;
}

const CampanhaContext = createContext<CampanhaContextProps | undefined>(
  undefined
);

// Provider do contexto
export const CampanhaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(campanhaReducer, initialState);

  // Função para avançar para a próxima etapa
  const nextStep = () => {
    if (state.currentStep < state.totalSteps) {
      dispatch({ type: "SET_CURRENT_STEP", payload: state.currentStep + 1 });
    }
  };

  // Função para voltar para a etapa anterior
  const prevStep = () => {
    if (state.currentStep > 1) {
      dispatch({ type: "SET_CURRENT_STEP", payload: state.currentStep - 1 });
    }
  };

  // Função para ir para uma etapa específica
  const goToStep = (step: number) => {
    if (step >= 1 && step <= state.totalSteps) {
      dispatch({ type: "SET_CURRENT_STEP", payload: step });
    }
  };

  // Função para definir a plataforma
  const setPlatform = (platform: PlatformType) => {
    dispatch({ type: "SET_PLATFORM", payload: platform });
  };

  // Função para definir a faixa selecionada
  const setSelectedTrack = (track: any) => {
    dispatch({ type: "SET_SELECTED_TRACK", payload: track });
  };

  // Função para definir as opções de segmentação
  const setTargetOptions = (options: Partial<TargetOptions>) => {
    dispatch({ type: "SET_TARGET_OPTIONS", payload: options as TargetOptions });
  };

  // Função para definir o orçamento
  const setBudget = (budget: number) => {
    dispatch({ type: "SET_BUDGET", payload: budget });
  };

  // Função para definir a observação
  const setObservation = (observation: string) => {
    dispatch({ type: "SET_OBSERVATION", payload: observation });
  };

  // Função para resetar a campanha
  const resetCampaign = () => {
    dispatch({ type: "RESET_CAMPAIGN" });
  };

  return (
    <CampanhaContext.Provider
      value={{
        state,
        nextStep,
        prevStep,
        goToStep,
        setPlatform,
        setSelectedTrack,
        setTargetOptions,
        setBudget,
        setObservation,
        resetCampaign,
      }}
    >
      {children}
    </CampanhaContext.Provider>
  );
};

// Hook para facilitar o uso do contexto
export const useCampanha = () => {
  const context = useContext(CampanhaContext);

  if (context === undefined) {
    throw new Error("useCampanha deve ser usado dentro de um CampanhaProvider");
  }

  return context;
};
